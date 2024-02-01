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

float distance(float x, float y, float range) {
  return min(1.0, abs(x - y) / range);
}

float idistance(float x, float y, float range) {
  return 1.0 - distance(x, y, range);
}

float steps(float x, float count) {
  float n = 1.0 / count;
  return ceil(x / n) * n;
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
  alpha += steps(idistance(x, lights[0].x, radius), 3.0) * lights[0].z;
  alpha += steps(idistance(x, lights[1].x, radius), 3.0) * lights[1].z;
  alpha += steps(idistance(x, lights[2].x, radius), 3.0) * lights[2].z;
  alpha += steps(idistance(x, lights[3].x, radius), 3.0) * lights[3].z;

  alpha = min(1.0, alpha);
  gl_FragColor = color * alpha;
}
