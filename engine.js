let cv1, ctx1, drawCv, drawCtx;
let mnist;
const nn = new NeuralNetwork(28 * 28, 16, 10);
let train_index = 0;
let labelTag, guessTag;
let startPaint = false;
let painting = false;
let mouseX = mouseY = 0;
let pMouseX = pMouseY = 0;
let w = 28;

window.onload = function() {
  setup();
}

const setup = function() {
  cv1 = document.getElementById('canvas');
  ctx1 = cv1.getContext('2d');
  drawCv = document.getElementById('draw');
  drawCtx = drawCv.getContext('2d');
  labelTag = document.getElementById('label');
  guessTag = document.getElementById('guess');
  drawCv.onmousedown = () => startPaint = painting = true;
  drawCv.onmouseup = () => painting = false;
  drawCv.onmousemove = function(event) {
    mouseX = event.clientX - drawCv.offsetLeft;
    mouseY = event.clientY - drawCv.offsetTop;
    pMouseX = mouseX - event.movementX;
    pMouseY = mouseY - event.movementY;
  };
  window.addEventListener('keydown', function(event) {
    if (event.keyCode == 32) {
      startPaint = painting = false;
      background(drawCv, 'black');
    };
  })
  loadMNIST(function(data) {
    mnist = data;
    background(drawCv, 'black');
    // draw();
    setInterval(draw, 1);
    setInterval(draw1, 1);
  });
};

const draw = function() {
  background(cv1, 'black');
  let img = new ImageData(w, w);
  let inputs = [];
  for (let i = 0; i < w * w; i++) {
    let bright = mnist.train_images[i + train_index * w * w];
    inputs.push(bright);
    img.data[i * 4 + 0] = bright;
    img.data[i * 4 + 1] = bright;
    img.data[i * 4 + 2] = bright;
    img.data[i * 4 + 3] = 255;
  }
  //Drawing training images
  let temp = document.createElement('canvas');
  temp.width = w;
  temp.height = w;
  let temp2 = temp.getContext('2d');
  temp2.putImageData(img, 0, 0);
  ctx1.drawImage(temp, 0, 0, cv1.width, cv1.height);
  //Neural Network Stuff
  let label = mnist.train_labels[train_index];
  let targets = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  targets[label] = 1;
  let guess = nn.feedforward(inputs).max(true);
  document.getElementById('info').className = (guess == label) ? 'correct' : 'wrong';
  labelTag.innerHTML = label;
  guessTag.innerHTML = guess;
  nn.train(inputs, targets);
  train_index++;
}

const draw1 = function() {
  if (painting) {
    drawCtx.fillStyle = 'white';
    drawCtx.strokeStyle = 'white';
    drawCtx.lineWidth = '5';
    // ellipse(drawCtx, mouseX, mouseY, 5, 5);
    line(drawCtx, pMouseX, pMouseY, mouseX, mouseY);
  }
  if (startPaint && !painting) {
    startPaint = false;
    let pixels = drawCtx.getImageData(0, 0, drawCv.width, drawCv.height);
    let temp = document.createElement('canvas');
    temp.width = w;
    temp.height = w;
    let temp2 = temp.getContext('2d');
    temp2.putImageData(pixels, 0, 0, 0, 0, w, w);
    pixels = temp2.getImageData(0, 0, w, w).data;
    let inputs = [];
    for (let i = 0; i < pixels.length; i += 4) {
      let r = pixels[i + 0];
      let g = pixels[i + 1];
      let b = pixels[i + 2];
      let grey = mean([r, g, b]);
      let a = 255;
      inputs.push(grey);
    };
    console.log(nn.feedforward(inputs).max(true));
  }
}

function loadMNIST(callback) {
  let mnist = {};
  loadFile('t10k-images.idx3-ubyte', 16)
    .then(data => {
      mnist.test_images = data;
      return loadFile('t10k-labels.idx1-ubyte', 8);
    })
    .then(data => {
      mnist.test_labels = data;
      return loadFile('train-images.idx3-ubyte', 16);
    })
    .then(data => {
      mnist.train_images = data;
      return loadFile('train-labels.idx1-ubyte', 8);
    })
    .then(data => {
      mnist.train_labels = data;
      callback(mnist);
    })
  async function loadFile(file, offset) {
    let r = await fetch(file);
    let data = await r.arrayBuffer();
    return new Uint8Array(data).slice(offset);
  }
}