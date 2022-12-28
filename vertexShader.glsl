attribute vec3 vertex;
attribute vec3 normal;
attribute vec2 textcoord;

uniform mat4 ModelViewProjectionMatrix;
uniform mat4 WorldInverseTranspose;
uniform mat4 WorldMatrix;
uniform vec3 LightWorldPosition;
uniform vec3 ViewWorldPosition;

uniform vec2 ScalePointLocation;
uniform float ScaleValue;
uniform vec3 ScalePointWorldLocation;

uniform bool bDrawpoint;

varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;
varying vec2 v_textcoord;

vec2 ScaleTextCoords(vec2 TextCoords, float Value, vec2 ScalePoint)
{
    vec3 CalculatedTextCoords = vec3(TextCoords, 1);

    mat3 ScaleMatrix = mat3(vec3(Value, 0.0, 0.0),
    vec3(0.0, Value, 0.0),
    vec3(0.0, 0.0, 1.0));

    mat3 TransformForward = mat3(vec3(1.0, 0.0, 0.0),
    vec3(0.0, 1.0, 0.0),
    vec3(-ScalePoint.x, -ScalePoint.y, 1.0));

    mat3 TransformBackward = mat3(vec3(1.0, 0.0, 0.0),
    vec3(0.0, 1.0, 0.0),
    vec3(ScalePoint.x, ScalePoint.y, 1.0));

    CalculatedTextCoords = TransformForward * CalculatedTextCoords;
    CalculatedTextCoords = ScaleMatrix * CalculatedTextCoords;
    CalculatedTextCoords = TransformBackward * CalculatedTextCoords;

    return CalculatedTextCoords.xy;
}

void main() {
    if (bDrawpoint == true) {
        gl_Position = ModelViewProjectionMatrix * vec4(ScalePointWorldLocation,1.0);
        gl_PointSize = 30.0;
    }
    else
    {
        gl_Position = ModelViewProjectionMatrix * vec4(vertex,1.0);

        v_normal = mat3(WorldInverseTranspose) * normal;

        vec3 surfaceWorldPosition = (WorldMatrix * vec4(vertex, 1.0)).xyz;
        v_surfaceToLight = LightWorldPosition - surfaceWorldPosition;
        v_surfaceToView = ViewWorldPosition - surfaceWorldPosition;

        v_textcoord = ScaleTextCoords(textcoord, ScaleValue, ScalePointLocation);

        gl_PointSize = 1.0;
    }
}