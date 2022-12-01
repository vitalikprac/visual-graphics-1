#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec4 color;
uniform vec3 LightDirection;

varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

void main() {
    vec3 normal = normalize(v_normal);

    vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
    vec3 surfaceToViewDirection = normalize(v_surfaceToView);
    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

    float shininess = 4.0;

    float innerLimit = cos(5.0 * 3.1415 / 180.0);
    float outerLimit = cos(15.0 * 3.1415 / 180.0);

    float dotFromDirection = dot(surfaceToLightDirection, -LightDirection);
    float inLight = smoothstep(outerLimit, innerLimit, dotFromDirection);
    float light = inLight * dot(normal, surfaceToLightDirection);
    float specular = inLight * pow(dot(normal, halfVector), shininess);

    gl_FragColor = color;
    gl_FragColor.rgb *= light;
    gl_FragColor.rgb += specular;
}