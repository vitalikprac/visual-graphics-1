import './style.css';
import './utils/m4.js';
import fragmentShaderSource from './fragmentShader.glsl';
import vertexShaderSource from './vertexShader.glsl';
import { TrackballRotator } from './utils/trackball-rotator.js';

let gl;                         // The webgl context.
let surface;                    // A surface model
let shProgram;                  // A shader program
let spaceball;                  // A SimpleRotator object that lets the user rotate the view by mouse.
let InputCounter = 0.0;
let ScalePointLocationU = 0.0;
let ScalePointLocationV = 0.0;
let ControllerScaleValue = 0.9;

function deg2rad(angle) {
  return angle * Math.PI / 180;
}

// Constructor
function Model(name) {
  this.name = name;
  this.iVertexBuffer = gl.createBuffer();
  this.iNormalBuffer = gl.createBuffer();
  this.iTextureBuffer = gl.createBuffer();
  this.iPointVertexBuffer = gl.createBuffer();
  this.count = 0;

  this.BufferData = function (vertices, normals, textCoords) {

    gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STREAM_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STREAM_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.iTextureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textCoords), gl.STREAM_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.iPointVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0]), gl.DYNAMIC_DRAW);

    this.count = vertices.length / 3;
  };

  this.Draw = function () {
    gl.uniform1i(shProgram.iDrawPoint, false);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
    gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shProgram.iAttribVertex);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
    gl.vertexAttribPointer(shProgram.iNormalVertex, 3, gl.FLOAT, true, 0, 0);
    gl.enableVertexAttribArray(shProgram.iNormalVertex);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.iTextureBuffer);
    gl.vertexAttribPointer(shProgram.iTextureCoords, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shProgram.iTextureCoords);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.count);
    // Draw point

    gl.uniform1i(shProgram.iDrawPoint, true);

    gl.uniform3fv(shProgram.iScalePointWorldLocation,
      [CalcX(ScalePointLocationU, ScalePointLocationV), CalcY(ScalePointLocationU, ScalePointLocationV), CalcZ(
        ScalePointLocationU,
        ScalePointLocationV)]);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
    gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shProgram.iAttribVertex);

    gl.drawArrays(gl.POINTS, 0, 1);
  };
}

// Constructor
function ShaderProgram(name, program) {

  this.name = name;
  this.prog = program;

  this.iAttribVertex = -1;
  this.iNormalVertex = -1;
  this.iTextureCoords = -1;
  this.iColor = -1;

  this.iModelViewProjectionMatrix = -1;
  this.iWorldMatrix = -1;
  this.iWorldInverseTranspose = -1;

  this.iLightWorldPosition = -1;
  this.iLightDirection = -1;

  this.iViewWorldPosition = -1;

  this.iTexture = -1;
  this.iScalePointLocation = -1;
  this.iScaleValue = -1;
  this.iDrawPoint = -1;
  this.iScalePointWorldLocation = -1;

  this.Use = function () {
    gl.useProgram(this.prog);
  };
}

function draw() {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  /* Set the values of the projection transformation */
  let projection = m4.perspective(Math.PI / 8, 1, 8, 12);

  /* Get the view matrix from the SimpleRotator object.*/
  let modelView = spaceball.getViewMatrix();

  let WorldMatrix = m4.translation(0, 0, -10);
  let matAccum1 = m4.multiply(WorldMatrix, modelView);
  let modelViewProjection = m4.multiply(projection, matAccum1);

  let worldInverseMatrix = m4.inverse(matAccum1);
  let worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);
  gl.uniform3fv(shProgram.iViewWorldPosition, [0, 0, 0]); // ?
  gl.uniform3fv(shProgram.iLightWorldPosition, CalcParabola());
  gl.uniform3fv(shProgram.iLightDirection, [0, 1, 0]);
  gl.uniformMatrix4fv(shProgram.iWorldInverseTranspose, false, worldInverseTransposeMatrix);
  gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, modelViewProjection);
  gl.uniformMatrix4fv(shProgram.iWorldMatrix, false, matAccum1);

  gl.uniform4fv(shProgram.iColor, [0.5, 0.5, 0.5, 1]);

  gl.uniform2fv(shProgram.iScalePointLocation, [ScalePointLocationU / 360.0, ScalePointLocationV / 90.0]);
  gl.uniform1f(shProgram.iScaleValue, ControllerScaleValue);

  gl.uniform1i(shProgram.iTexture, 0);

  surface.Draw();
}

let zm = 4;

function CalcX(r, u) {
  return r * Math.cos(u) / zm;
}

function CalcY(r, u) {
  return r * Math.sin(u) / zm;
}

function CalcZ(r, u, b, m, a, n, phi) {
  let w = m * Math.PI / b;
  return a * Math.pow(Math.E, -n * r) * Math.sin(w * r + phi) / zm;
}

function CreateSurfaceData() {
  const vertexList = [];
  const normalsList = [];

  const textCoords = [];

  let DeltaR = 0.0001;
  let DeltaU = 0.0001;

  let m = 6;
  let b = 6;
  let a = 4;
  let n = 0.5;
  let phi = 0;
  for (let r = 0; r <= b; r += 0.001) {
    for (let u = 0; u < 2 * Math.PI; u += 0.5) {
      let x = CalcX(r, u);
      let y = CalcY(r, u);
      let z = CalcZ(r, u, b, m, a, n, phi);
      vertexList.push(x, y, z);
      let DerivativeR = CalcDerivativeR(r, u, DeltaR, b, m, a, n, phi);
      let DerivativeU = CalcDerivativeU(r, u, DeltaU, b, m, a, n, phi);
      let result = m4.cross(DerivativeU, DerivativeR);
      normalsList.push(result[0], result[1], result[2]);
      textCoords.push(r / b, u / 2 * Math.PI);
    }
  }
  return [vertexList, normalsList, textCoords];
}

function CalcDerivativeR(r, u, uDelta, b, m, a, n, phi) {
  let x = CalcX(r, u);
  let y = CalcY(r, u);
  let z = CalcZ(r, u, b, m, a, n, phi);

  let Dx = CalcX(r + uDelta, u);
  let Dy = CalcY(r + uDelta, u);
  let Dz = CalcZ(r + uDelta, u, b, m, a, n, phi);

  let Dxdu = (Dx - x) / deg2rad(uDelta);
  let Dydu = (Dy - y) / deg2rad(uDelta);
  let Dzdu = (Dz - z) / deg2rad(uDelta);

  return [Dxdu, Dydu, Dzdu];
}

function CalcDerivativeU(r, u, vDelta, b, m, a, n, phi) {
  let x = CalcX(r, u);
  let y = CalcY(r, u);
  let z = CalcZ(r, u, b, m, a, n, phi);

  let Dx = CalcX(r, u + vDelta);
  let Dy = CalcY(r, u + vDelta);
  let Dz = CalcZ(r, u + vDelta, b, m, a, n, phi);

  let Dxdv = (Dx - x) / deg2rad(vDelta);
  let Dydv = (Dy - y) / deg2rad(vDelta);
  let Dzdv = (Dz - z) / deg2rad(vDelta);

  return [Dxdv, Dydv, Dzdv];
}


/* Initialize the WebGL context. Called from init() */
function initGL() {
  let prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  shProgram = new ShaderProgram('Basic', prog);
  shProgram.Use();

  shProgram.iAttribVertex = gl.getAttribLocation(prog, 'vertex');
  shProgram.iNormalVertex = gl.getAttribLocation(prog, 'normal');
  shProgram.iTextureCoords = gl.getAttribLocation(prog, 'textcoord');

  shProgram.iColor = gl.getUniformLocation(prog, 'color');

  shProgram.iModelViewProjectionMatrix = gl.getUniformLocation(prog, 'ModelViewProjectionMatrix');
  shProgram.iWorldInverseTranspose = gl.getUniformLocation(prog, 'WorldInverseTranspose');
  shProgram.iWorldMatrix = gl.getUniformLocation(prog, 'WorldMatrix');

  shProgram.iLightWorldPosition = gl.getUniformLocation(prog, 'LightWorldPosition');
  shProgram.iLightDirection = gl.getUniformLocation(prog, 'LightDirection');

  shProgram.iViewWorldPosition = gl.getUniformLocation(prog, 'ViewWorldPosition');

  shProgram.iTexture = gl.getUniformLocation(prog, 'u_texture');

  shProgram.iScalePointLocation = gl.getUniformLocation(prog, 'ScalePointLocation');
  shProgram.iScaleValue = gl.getUniformLocation(prog, 'ScaleValue');

  shProgram.iDrawPoint = gl.getUniformLocation(prog, 'bDrawpoint');

  shProgram.iScalePointWorldLocation = gl.getUniformLocation(prog, 'ScalePointWorldLocation');

  surface = new Model('Surface');
  let SurfaceData = CreateSurfaceData();
  surface.BufferData(SurfaceData[0], SurfaceData[1], SurfaceData[2]);
}


/* Creates a program for use in the WebGL context gl, and returns the
 * identifier for that program.  If an error occurs while compiling or
 * linking the program, an exception of type Error is thrown.  The error
 * string contains the compilation or linking error.  If no error occurs,
 * the program identifier is the return value of the function.
 * The second and third parameters are strings that contain the
 * source code for the vertex shader and for the fragment shader.
 */
function createProgram(gl, vShader, fShader) {
  let vsh = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vsh, vShader);
  gl.compileShader(vsh);
  if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
    throw new Error('Error in vertex shader:  ' + gl.getShaderInfoLog(vsh));
  }
  let fsh = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fsh, fShader);
  gl.compileShader(fsh);
  if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
    throw new Error('Error in fragment shader:  ' + gl.getShaderInfoLog(fsh));
  }
  let prog = gl.createProgram();
  gl.attachShader(prog, vsh);
  gl.attachShader(prog, fsh);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error('Link error in program:  ' + gl.getProgramInfoLog(prog));
  }
  return prog;
}


/**
 * initialization function that will be called when the page has loaded
 */
function init() {
  let canvas;
  try {
    canvas = document.getElementById('webglcanvas');
    gl = canvas.getContext('webgl');
    if (!gl) {
      throw 'Browser does not support WebGL';
    }
  } catch (e) {
    document.getElementById('canvas-holder').innerHTML =
      '<p>Sorry, could not get a WebGL graphics context.</p>';
    return;
  }
  try {
    initGL();  // initialize the WebGL graphics context
  } catch (e) {
    document.getElementById('canvas-holder').innerHTML =
      '<p>Sorry, could not initialize the WebGL graphics context: ' + e + '</p>';
    return;
  }

  spaceball = new TrackballRotator(canvas, draw, 0);

  LoadTexture();
}


const processKeys = [
  {
    keys: ['ArrowLeft'],
    func: () => {
      InputCounter -= 0.05;
      draw();
    },
  },
  {
    keys: ['ArrowRight'],
    func: () => {
      InputCounter -= 0.05;
      draw();
    },
  },
  {
    keys: ['W','w'],
    func: () => {
      ScalePointLocationV -= 5.0;
      ScalePointLocationV = clamp(ScalePointLocationV, 0.0, 90);
    }
  },
  {
    keys: ['S','s'],
    func: () => {
      ScalePointLocationV += 5.0;
      ScalePointLocationV = clamp(ScalePointLocationV, 0.0, 90);
    }
  },
  {
    keys: ['A', 'a'],
    func: () => {
      ScalePointLocationU -= 5.0;
      ScalePointLocationU = clamp(ScalePointLocationU, 0.0, 360);
    }
  },
  {
    keys: ['D', 'd'],
    func: () => {
      ScalePointLocationU += 5.0;
      ScalePointLocationU = clamp(ScalePointLocationU, 0.0, 360);
    }
  },
  {
    keys: ['Q', 'q'],
    func: () => {
      ControllerScaleValue += 0.05;
      ControllerScaleValue = clamp(ControllerScaleValue, 0.5, 2.0);
    }
  },
  {
    keys: ['E', 'e'],
    func: () => {
      ControllerScaleValue -= 0.05;
      ControllerScaleValue = clamp(ControllerScaleValue, 0.5, 2.0);
    }
  }];

window.addEventListener('keydown', function (event) {
  const found = processKeys.find((key) => key.keys.includes(event.key));
  if (found) {
    found.func();
    draw(); 
  }
});

function CalcParabola() {
  const TParam = Math.sin(InputCounter) * 1.2;
  return [TParam, -6, -10 + (TParam * TParam)];
}

function LoadImage(texture) {
  const image = new Image();
  image.src = 'texture.png';
  image.addEventListener('load', function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    draw();
  });
}

function LoadTexture() {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
  LoadImage(texture)
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}


document.addEventListener('DOMContentLoaded', init);

