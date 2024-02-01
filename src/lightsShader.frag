// global uniforms
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform highp vec4 inputSize;
uniform highp vec4 outputFrame;

// custom uniforms
uniform float radius;
uniform vec3 lights[4]; // vec3(x, y, intensity)

float luminance(vec3 rgb) {
  return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
}

float invertedDistance(float x, float y, float radius) {
  return max(0.0, 1.0 - (abs(x - y) / radius));
}

void main(void) {
  vec4 color = texture2D(uSampler, vTextureCoord);

  // ignore already transparent pixels
  if (color.a == 0.0) {
    gl_FragColor = color;
    return;
  }

  // https://github.com/pixijs/pixijs/wiki/v5-Creating-filters#conversion-functions
  float x = vTextureCoord.x * inputSize.x + outputFrame.x;

  float alpha = 0.0;
  alpha += invertedDistance(x, lights[0].x, radius) * lights[0].z;
  alpha += invertedDistance(x, lights[1].x, radius) * lights[1].z;
  alpha += invertedDistance(x, lights[2].x, radius) * lights[2].z;
  alpha += invertedDistance(x, lights[3].x, radius) * lights[3].z;
  alpha = min(1.0, alpha);

  color.rgb *= alpha;
  color.a = alpha;
  gl_FragColor = color;
}
