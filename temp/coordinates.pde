/* @pjs preload=""technical.png; */
PImage fullimage;

void setup(){
  size(1366, 768);
  fullimage = loadImage("technical.png");
  image(fullimage, 0,0);
  
}
