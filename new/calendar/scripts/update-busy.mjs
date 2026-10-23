// Writes busy.json: how many calendar events you have on each day.
// Counts only. Event titles, times, attendees and links are never written.
//
// Needs these environment variables (set as GitHub Actions secrets):
//   GOOGLE_SERVICE_ACCOUNT_JSON  full contents of the service account key file
//   CALENDAR_ID                  the email address of the calendar to count
// Optional: TIMEZONE (default Asia/Kolkata), MONTHS_BACK (12), MONTHS_AHEAD (6), OUT (busy.json)

import { createSign } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const TIMEZONE = process.env.TIMEZONE || 'Asia/Kolkata';
const MONTHS_BACK = Number(process.env.MONTHS_BACK || 12);
const MONTHS_AHEAD = Number(process.env.MONTHS_AHEAD || 6);
const OUT = process.env.OUT || 'busy.json';

const dayFmt = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

const pad = (n) => String(n).padStart(2, '0');
const key = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return { y, m: m - 1, d }; };

export function dayOf(date) {
  const o = {};
  for (const p of dayFmt.formatToParts(date)) o[p.type] = p.value;
  return `${o.year}-${o.month}-${o.day}`;
}

export function addDays(k, n) {
  const { y, m, d } = parseKey(k);
  const t = new Date(Date.UTC(y, m, d + n));
  return key(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
}

// events: items from the Calendar API (singleEvents=true). from/to: inclusive YYYY-MM-DD.
export function countDays(events, from, to) {
  const counts = {};
  for (const e of events) {
    if (!e || e.status === 'cancelled') continue;
    if (e.eventType === 'workingLocation' || e.eventType === 'birthday') continue;
    if (Array.isArray(e.attendees) && e.attendees.some((a) => a && a.self && a.responseStatus === 'declined')) continue;

    let s, t;
    if (e.start && e.start.date) {
      // All-day event: the end date is exclusive.
      s = e.start.date;
      t = e.end && e.end.date ? addDays(e.end.date, -1) : s;
      if (t < s) t = s;
    } else if (e.start && e.start.dateTime) {
      const a = new Date(e.start.dateTime);
      if (Number.isNaN(a.getTime())) continue;
      const b = e.end && e.end.dateTime ? new Date(e.end.dateTime) : a;
      s = dayOf(a);
      // An event ending exactly at midnight does not count towards the next day.
      t = b > a ? dayOf(new Date(b.getTime() - 1)) : s;
    } else {
      continue;
    }

    let d = s < from ? from : s;
    const stop = t > to ? to : t;
    for (let guard = 0; d <= stop && guard < 62; guard++, d = addDays(d, 1)) {
      counts[d] = (counts[d] || 0) + 1;
    }
  }
  return counts;
}

function die(msg) {
  console.error(msg);
  process.exit(1);
}

const b64url = (data) => Buffer.from(data).toString('base64url');

async function getAccessToken(creds) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(creds.private_key).toString('base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) die(`Could not get a Google access token: ${json.error_description || json.error || res.status}`);
  return json.access_token;
}

async function fetchEvents(token, calendarId, timeMin, timeMax) {
  const base = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
  const events = [];
  let pageToken = null;
  for (let page = 0; page < 50; page++) {
    const params = new URLSearchParams({
      timeMin, timeMax, singleEvents: 'true', orderBy: 'startTime', maxResults: '2500',
    });
    if (pageToken) params.set('pageToken', pageToken);
    const res = await fetch(`${base}?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json().catch(() => ({}));
    if (res.status === 404) {
      die('Calendar not found. Share the calendar with the service account email ("See all event details") and check CALENDAR_ID.');
    }
    if (!res.ok) die(`Google Calendar API error ${res.status}: ${(json.error && json.error.message) || 'unknown error'}`);
    if (Array.isArray(json.items)) events.push(...json.items);
    pageToken = json.nextPageToken || null;
    if (!pageToken) break;
  }
  return events;
}

async function main() {
  const calendarId = process.env.CALENDAR_ID;
  if (!calendarId) die('CALENDAR_ID is not set.');
  let creds;
  try {
    creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '');
  } catch {
    die('GOOGLE_SERVICE_ACCOUNT_JSON is missing or is not valid JSON. Paste the whole key file as the secret.');
  }
  if (!creds.client_email || !creds.private_key) die('The service account key is missing client_email or private_key.');

  const today = parseKey(dayOf(new Date()));
  const startIdx = today.y * 12 + today.m - MONTHS_BACK;
  const endIdx = today.y * 12 + today.m + MONTHS_AHEAD;
  const fromY = Math.floor(startIdx / 12), fromM = startIdx % 12;
  const toY = Math.floor(endIdx / 12), toM = endIdx % 12;
  const lastDay = new Date(Date.UTC(toY, toM + 1, 0)).getUTCDate();
  const from = key(fromY, fromM, 1);
  const to = key(toY, toM, lastDay);

  // One day of padding either side (in UTC) so any time zone is covered; countDays clamps to from/to.
  const timeMin = new Date(Date.UTC(fromY, fromM, 1) - 864e5).toISOString();
  const timeMax = new Date(Date.UTC(toY, toM, lastDay + 1) + 864e5).toISOString();

  const token = await getAccessToken(creds);
  const events = await fetchEvents(token, calendarId, timeMin, timeMax);
  const counts = countDays(events, from, to);

  const days = {};
  for (const k of Object.keys(counts).sort()) days[k] = counts[k];

  // `updated` is a date only, so a run that finds nothing new produces an identical file and no commit.
  const out = { updated: dayOf(new Date()), timeZone: TIMEZONE, from, to, days };
  const text = JSON.stringify(out, null, 1) + '\n';
  if (existsSync(OUT) && readFileSync(OUT, 'utf8') === text) {
    console.log(`${OUT} is already up to date.`);
    return;
  }
  writeFileSync(OUT, text);
  const total = Object.values(days).reduce((a, b) => a + b, 0);
  console.log(`Wrote ${OUT}: ${total} events across ${Object.keys(days).length} days (${from} to ${to}).`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err) => die(`Update failed: ${err && err.message ? err.message : err}`));
}
