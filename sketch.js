let mic, micLevel, r, g, b, h;
let fft;
let canvasSize = 1000;
let frequencies = ["bass", "lowMid", "mid", "highMid", "treble"];

function brownianUpdate(x, low, high, delta) {
  x += random(-delta, delta);
  return min(high, max(x, low));
}
function Shape(frequency, x, y, radius, r, g, b) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.r = r;
  this.g = g;
  this.b = b;
  this.frequency = frequency;

  this.draw = function () {
    fill(color(this.r, this.g, this.b)), random(0.25, 0.75);
    circle(this.x, this.y, this.radius);
  };

  this.update = function () {
    let energy = fft.getEnergy(this.frequency);
    delta = abs(this.radius - energy / 2);
    this.r = brownianUpdate(this.r, 0, 255, delta);
    this.g = brownianUpdate(this.g, 0, 255, delta);
    this.b = brownianUpdate(this.b, 0, 255, delta);

    let xyDelta = canvasSize / (energy  + 100);
    this.x = brownianUpdate(this.x, 0, canvasSize, xyDelta);
    this.y = brownianUpdate(this.y, 0, canvasSize, xyDelta);

    this.radius = energy / 2;
  };
}
let shapes = [];
function setup() {
  ellipseMode(RADIUS);
  colorMode(HSB, 255, 100, 100);
  createCanvas(canvasSize, canvasSize);
  mic = new p5.AudioIn();
  fft = new p5.FFT();
  mic.connect(fft);
  mic.start();

  micLevel = mic.getLevel();

  h = 0;

  let spectrum = fft.analyze();
  let colorDelta = 10;
  // console.log(spectrum)
  let soundwave = fft.waveform();
  for (let i = 0; i < frequencies.length; i++) {
    let r = random(255);
    let g = random(255);
    let b = random(255);
    for (let j = 0; j < 1 + i; j++) {
      let frequency = frequencies[i];
      energy = fft.getEnergy(frequency);
      let x = 20 + 170 * i;
      let y = random(0, canvasSize);
      let shape = new Shape(frequency, x, y, energy, r, g, b);

      shapes.push(shape);
    }
    r = brownianUpdate(r, 0, 255, colorDelta );
     g = brownianUpdate(g, 0, 255, colorDelta );
    b = brownianUpdate(b, 0, 255, colorDelta );
  }

  oldLevel = 0;
}

let oldLevel;
function draw() {
  background(0);

  let spectrum = fft.analyze();
  noStroke();

  for (let i = 0; i < shapes.length; i++) {
    let shape = shapes[i];
    shape.draw();
    shape.update();
  }

  h += random(-5, 5);
  oldLevel = micLevel;
}
