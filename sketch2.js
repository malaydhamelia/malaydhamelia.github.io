var canvas;

let img, img2;
let r=1;
let t=10;
let a =0.0;
let inc = 3.14/25.0;
let out=10;

let x = 1;
let y = 1;
let easing = 0.15;


function preload(){
    img=loadImage('/m.png');
    img2=loadImage('/m2.png');
}

function setup(){
 canvas=createCanvas(screen.width, screen.height+1500);
 canvas.position(0,0);
 canvas.style('z-index', '-51')
}

function draw(){
background(242, 242, 242, 255);
// rotate(PI /180 * 45);
if(frameCount/60<=5){
let targetX = mouseX;
  let dx = targetX - x;
  x += dx * easing;

  let targetY = mouseY;
  let dy = targetY - y;
  y += dy * easing;
  image(img, x,y, 16, 16);
}

if(frameCount/60>=5 && frameCount/60<10){
    targetX=mouseX+easing*15*random(r);
    targetY=mouseY;
    let dx = targetX - x;
    x += dx * easing;
    let dy = targetY - y;
    y += dy * easing;
    r++;
    image(img, x,y, 16, 16);
}



if(frameCount/60>=10 && frameCount/60<20){
    let dy=y*sin(a)/4;
    y+=dy*easing*0.2;
    image(img2, x,y,20, 20);
    a=a+inc;
}

if(frameCount/60>=20 && frameCount/60<25){
    
    let dy=y*sin(a)/4;
    y+=dy*easing*0.4;
    image(img2, x,y+random(20),20, 20);
    a=a+(inc*3);
}

if(frameCount/60>=25){
   
    let dy=y*sin(a)/4;
    y+=dy*easing*0.6;
    image(img2, x+out,y+random(50),20, 20);
    a=a+(inc*6);
    out++;
    if(x+out>=screen.width)
    {
        window.onscroll=function(){window.scrollTo(10, 1200);};
    }
}


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