#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec4 color;
uniform vec3 LightDirection;
uniform bool bDrawpoint;

varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;
varying vec2 v_textcoord;

uniform sampler2D u_texture;

void main() {
    if (bDrawpoint == true) {
        gl_FragColor = color;
    }
    else
    {
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

    vec4 TextureColor = texture2D(u_texture, v_textcoord);

    gl_FragColor = color;
    gl_FragColor.rgb *= light;
    gl_FragColor.rgb += specular;

    gl_FragColor += TextureColor;
    }
}