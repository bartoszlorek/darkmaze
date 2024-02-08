varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform highp vec4 inputSize;
uniform highp vec4 outputFrame;

/**
 * vec3(
 *   float x,
 *   float radius,
 *   float intensity,
 * );
 */
uniform vec3 lights[4];

float luminance(vec3 rgb) {
  return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
}

float distance(float x, float y, float range) {
  return min(1.0, abs(x - y) / range);
}

float idistance(float x, float y, float range) {
  return 1.0 - distance(x, y, range);
}

float steps(float x, float size) {
  return ceil(x / size) * size;
}

float easeOutQuad(float x) {
  return x * (2.0 - x);
}

float calculateLight(float x, vec3 light) {
  float value = idistance(x, light.x, light.y);
  value = easeOutQuad(value);
  value *= light.z;
  return value;
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

  // pixel-like appearance
  x = steps(x, 12.0);

  float lum = luminance(color.rgb);
  float alpha = 0.0;

  alpha += calculateLight(x, lights[0]);
  alpha += calculateLight(x, lights[1]);
  alpha += calculateLight(x, lights[2]);
  alpha += calculateLight(x, lights[3]);
  alpha = min(1.0, alpha);

  gl_FragColor = color * (lum < 1.0 - alpha ? 0.0 : 1.0);
}
