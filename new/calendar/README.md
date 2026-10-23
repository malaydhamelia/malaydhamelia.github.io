# Calendar heatmap (counts only)

A public page that shades each day by how many Google Calendar events you have.
Visitors see only the number of events per day. Titles, times, attendees and links are never published.

How it works: a GitHub Action runs every 6 hours, reads your calendar, and writes the per-day counts to `busy.json`. The page (`index.html`) reads that file.

```
index.html
busy.json                          (placeholder, replaced by the Action)
scripts/update-busy.mjs
.github/workflows/update-busy.yml
```

## One-time setup

### 1. Service account (in the Google Cloud project you already made)
1. Open console.cloud.google.com and select your project. The Google Calendar API is already enabled.
2. Go to IAM & Admin, then Service Accounts, then Create service account. Name it "calendar-counts". Skip the optional role and user steps.
3. Open the new service account, go to Keys, then Add key, then Create new key, choose JSON, and click Create. A `.json` file downloads. Treat it like a password and never commit it.
4. Copy the service account's email address (it ends in `.iam.gserviceaccount.com`).

### 2. Share your calendar with it
1. Open calendar.google.com, hover over your calendar in the left list, click the three dots, then Settings and sharing.
2. Under Share with specific people or groups, click Add people and groups.
3. Paste the service account email and set permission to "See all event details". Send.

If Google says sharing outside your organization isn't allowed, your institute's admin has blocked it. In that case ask me for a manual snapshot instead.

### 3. Add the secrets to your GitHub repository
Repository, then Settings, then Secrets and variables, then Actions, then New repository secret. Add two:
- `GOOGLE_SERVICE_ACCOUNT_JSON`: open the downloaded key file in a text editor and paste its entire contents.
- `CALENDAR_ID`: your calendar's email address, for example `malay.dhamelia@iitgn.ac.in`.

### 4. Upload the files and turn on Pages
1. Put all the files above in the repository, keeping the folder layout. The `.github` folder must be at the top level.
2. Settings, then Pages, then Deploy from a branch, then `main` and `/ (root)`.
3. Settings, then Actions, then General, then Workflow permissions: pick "Read and write permissions" if the first run can't push.

### 5. First run
Open the Actions tab, choose "Update calendar counts", and click Run workflow. When it finishes (about a minute), `busy.json` is updated and the page shows your counts. After that it refreshes itself every 6 hours.

## Notes
- The page covers 12 months back and 6 months ahead. Change `MONTHS_BACK` and `MONTHS_AHEAD` in the workflow's `env` section if you want a different range.
- `busy.json` is public. It contains only dates and counts.
- GitHub pauses scheduled workflows in repositories with no activity for 60 days. If that happens, re-enable it from the Actions tab.
- To show it on your website, link to the Pages address or embed it with an iframe.
