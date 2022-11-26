// Vertex shader
export const vertexShaderSource = `
#define GLSLIFY 1

attribute vec3 vertex;
uniform mat4 ModelViewProjectionMatrix;

void main() {
    gl_Position = ModelViewProjectionMatrix * vec4(vertex,1.0);
}`;


// Fragment shader
export const fragmentShaderSource = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
   precision highp float;
#else
   precision mediump float;
#endif
#define GLSLIFY 1
// Common uniforms
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_frame;

/*
 * Random number generator with a vec2 seed
 *
 * Credits:
 * http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0
 * https://github.com/mattdesl/glsl-random
 */
float random2d(vec2 co) {
    float a = 15.9898;
    float b = 78.233;
    float c = 43758.5453;
    float dt = dot(co.xy, vec2(a, b));
    float sn = mod(dt, 3.14);
    return fract(sin(sn) * c);
}

/*
 * The main program
 */
void main() {
    // Create a grid of squares that depends on the mouse position
    vec2 square = floor((gl_FragCoord.xy - u_mouse) / 30.0);

    // Give a random color to each square
    vec3 square_color = vec3(random2d(square), random2d(1.234 * square), 1.0);

    // Fragment shader output
    gl_FragColor = vec4(square_color, 1.0);
}`;