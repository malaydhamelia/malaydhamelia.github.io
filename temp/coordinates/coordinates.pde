/* @pjs preload="technical_reduced.png", "seven.gif", "six.gif"; */

int numFrames_six = 40;  // The number of frames in the animation six
int numFrames_seven = 14;  // The number of frames in the animation seven

int currentFrame_six = 1;
int currentFrame_seven = 1;

PImage[] images_six = new PImage[numFrames_six];
PImage[] images_seven = new PImage[numFrames_seven];

PImage fullimage;
int i,j=1;
void setup(){
  size(1366, 3074);
  frameRate(14);
  fullimage = loadImage("technical_reduced.png");
  image(fullimage, 0,0);
 //loading imags for sixth box
   for (int i = 1; i < numFrames_six; i++) {
    String imageName_six = nf(i, 2) + ".jpg";
    images_six[i] = loadImage(imageName_six);
  }
 //loading images for the seventh box
    for (int i = 1; i < numFrames_seven; i++) {
    String imageName_seven = "S_"+ nf(i, 1) + ".jpg";
    images_seven[i] = loadImage(imageName_seven);
  }
}

void draw(){

images_six[currentFrame_six].resize(275,0);
image(images_six[currentFrame_six], 107, 1075); 
currentFrame_six+=1;

images_seven[currentFrame_seven].resize(340,0);
image(images_seven[currentFrame_seven],810, 865);
currentFrame_seven+=1;


 if(currentFrame_six==40){
   
   currentFrame_six=1;
 }
 if(currentFrame_seven==14){
   currentFrame_seven=1;
 }
 

}
