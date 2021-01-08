var canvas;

let img;
let r=1;

let x = 1;
let y = 1;
let easing = 0.15;


function preload(){
    img=loadImage('/m.png');
}

function setup(){
 canvas=createCanvas(screen.width, screen.height+1500);
 canvas.position(0,0);
 canvas.style('z-index', '-1')
}

function draw(){
background(242, 242, 242);
// rotate(PI /180 * 45);
if(frameCount/60<=10){
let targetX = mouseX;
  let dx = targetX - x;
  x += dx * easing;

  let targetY = mouseY;
  let dy = targetY - y;
  y += dy * easing;
}


if(frameCount/60>=10 && frameCount/60<20){
    targetX=mouseX+easing*15*random(r);
    targetY=mouseY;
    let dx = targetX - x;
    x += dx * easing;
    let dy = targetY - y;
    y += dy * easing;
    r++;
    image(img, x,y, 16, 16);
}

if(frameCount/60>=20){
    targetX=x+easing*25*random(r);
    // targetY=y+easing*random(r);
    let dx = targetX - x;
    x += dx * easing;
    let dy = targetY - y;
    y += dy * easing;
    r++;
    if(x>=screen.width){
    
        var p=window.scrollX;
        var q=window.scrollY;
        window.onscroll=function(){window.scrollTo(10, 1200);};
        
    }
    
}

image(img, x,y, 16, 16);

}

function mouseClicked(){
    r=0;
    frameCount=0;
    targetX=mouseX;
    targetY=mouseY;
    let dx = targetX-x;
    let dy = targetY-y;
    x += dx * easing;
    y += dy * easing;
    image(img, x,y, 16, 16);
    window.onscroll=function(){};
   
}





// if the timeincreases, irritation decreases
// as the time increases, it moves away from the original cursor
// as the time increases, the cursor comes in like on T's website