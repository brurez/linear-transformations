function setup() {
  createCanvas(640, 480);
}

function draw() {
  background(200);
  push();
  translate(width / 2, height / 2);
  drawAxes();
  beginShape();
  for (let i = 0; i < tShape.length; i++) {
    vertex(tShape[i][0][0], -tShape[i][1][0]);
  }
  endShape(CLOSE);
  pop();
}

function drawAxes() {
  push();
  stroke(100, 155, 100);
  line(-height / 2, 0, height / 2, 0);
  line(0, -width / 2, 0, width / 2);
  pop();
}
