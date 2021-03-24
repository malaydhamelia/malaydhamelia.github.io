var canvas;

let img;
let r=1;

let x = 1;
let y = 1;
let easing = 0.15;
let size_mouse=16;
let size_mouse_display;
let t1=3; //time untill when the cursor just eases and follows the user's cursor
let t2=5; //time untill when the cursor just slowly increases in size
// let t3=45


function preload(){
    img=loadImage('/m.png');
}

function setup(){
 canvas=createCanvas(screen.width, screen.height+1500);
 canvas.position(0,0);
 canvas.style('z-index', '-1')
}

function draw(){
    background(243, 243, 243);
if (frameCount/60<=t1){
    //do nothing, but follow the mouse with ease
    let targetX = mouseX;
  let dx = targetX - x;
  x += dx * easing;

  let targetY = mouseY;
  let dy = targetY - y;
  y += dy * easing;
  size_mouse_display=size_mouse;
}
if (frameCount/60>t1 && frameCount/60<=t2){
    //Slowly, the cursor increases in the size

    let targetX = mouseX;
    let dx = targetX - x;
    x += dx * easing;
  
    let targetY = mouseY;
    let dy = targetY - y;
    y += dy * easing;
    size_mouse_display=size_mouse+r
    
    r+=0.5;
}
if (frameCount/60>t2){
    //moves along a randomly generated spline, always heading through the pointed arrow
}   
image(img, x, y, size_mouse_display, size_mouse_display);
}




// if the timeincreases, irritation decreases
// as the time increases, it moves away from the original cursor
// as the time increases, the cursor comes in like on T's website