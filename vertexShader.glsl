attribute vec3 vertex;
attribute vec3 normal;

uniform mat4 ModelViewProjectionMatrix;
uniform mat4 WorldInverseTranspose;
uniform mat4 WorldMatrix;
uniform vec3 LightWorldPosition;
uniform vec3 ViewWorldPosition;

varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

void main() {
    gl_Position = ModelViewProjectionMatrix * vec4(vertex,1.0);
    
    v_normal = mat3(WorldInverseTranspose) * normal;

    vec3 surfaceWorldPosition = (WorldMatrix * vec4(vertex, 1.0)).xyz;
    v_surfaceToLight = LightWorldPosition - surfaceWorldPosition;
    v_surfaceToView = ViewWorldPosition - surfaceWorldPosition;
}