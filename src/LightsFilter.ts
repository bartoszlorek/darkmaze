import { defaultFilterVertex, Filter } from "@pixi/core";
import { lerp } from "./helpers";
import fragment from "./lightsShader.frag";

export class Light {
  public x: number = 0;
  public radius: number = 0;
  public intensity: number = 0; // [0..1]

  // ability to change
  public speedIn: number = 0.1;
  public speedOut: number = 0.008;

  /**
   * vec3(
   *   float x,
   *   float radius,
   *   float intensity,
   * );
   */
  static vectorSize = 3;

  setPosition(x: number) {
    this.x = x;
    return this;
  }

  setRadius(radius: number) {
    this.radius = radius;
    return this;
  }

  setIntensity(value: number) {
    const speed = this.intensity < value ? this.speedIn : this.speedOut;
    this.intensity = lerp(this.intensity, value, speed);
    return this;
  }

  toVectorArray(output: number[], index: number) {
    output[Light.vectorSize * index + 0] = this.x;
    output[Light.vectorSize * index + 1] = this.radius;
    output[Light.vectorSize * index + 2] = this.intensity;
    return output;
  }
}

export class LightsFilter extends Filter {
  public lightsCount: number;

  constructor(lightsCount: number = 4) {
    /**
     * https://www.khronos.org/opengl/wiki/Uniform_(GLSL)
     */
    const uniforms = {
      lights: new Float32Array(Light.vectorSize * lightsCount),
    };

    /**
     * https://github.com/pixijs/pixijs/wiki/v5-Creating-filters#default-vertex-shader
     * https://github.com/pixijs/pixijs/blob/dev/packages/core/src/filters/defaultFilter.vert
     */
    super(defaultFilterVertex, fragment, uniforms);
    this.lightsCount = lightsCount;
  }

  setLights(lights: Light[]) {
    for (let i = 0; i < this.lightsCount; i++) {
      lights[i].toVectorArray(this.uniforms.lights, i);
    }
  }
}
