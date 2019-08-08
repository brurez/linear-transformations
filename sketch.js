function setup() {
  createCanvas(640, 480);
}

function draw() {
  const matchColors = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
  background(200);
  push();
  translate(width / 2, height / 2);
  drawAxes();
  for (let j = 0; j < transShapes.length; j++) {
    const { color, points } = transShapes[j];
    fill(color || 'rgba(255,255,255,0.6)');
    beginShape();
    points.forEach(point => {
      vertex(point[0][0], -point[1][0]);
    });
    endShape(CLOSE);
  }
  pop();
}

function drawAxes() {
  push();
  stroke(100, 155, 100);
  line(-height / 2, 0, height / 2, 0);
  line(0, -width / 2, 0, width / 2);
  pop();
}
