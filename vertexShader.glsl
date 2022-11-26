#define GLSLIFY 1

attribute vec3 vertex;
attribute vec3 normal;
uniform mat4 ModelViewProjectionMatrix;
uniform mat3 normalMatrix;

varying vec3 v_position;
varying vec3 v_normal;

void main() {
    v_position = vec3(0,0,0);
    v_normal = normalize(normalMatrix * normal);
    
    gl_Position = ModelViewProjectionMatrix * vec4(vertex,1.0);
}