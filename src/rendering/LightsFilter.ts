import { defaultFilterVertex, Filter } from "@pixi/core";
import { lerp } from "../helpers";
import fragment from "./lightsShader.frag";

export class Light {
  public x: number = 0;
  public radius: number = 0;

  // brightness
  public intensity: number = 0;
  protected intensityTarget: number = 0;
  protected enabled: boolean = false;

  // ability to change
  protected speedUp: number = 0.1;
  protected speedDown: number = 0.008;
  protected delay: number = 0;

  /**
   * vec3(
   *   float x,
   *   float radius,
   *   float intensity,
   * );
   */
  static vectorSize = 3;

  setIntensity(value: number, delay: number = 0) {
    if (this.intensityTarget !== value) {
      this.intensityTarget = value;
      this.delay = delay;
    }
  }

  update(deltaTime: number) {
    this.delay = Math.max(0, this.delay - deltaTime);

    if (this.delay > 0 || this.intensity === this.intensityTarget) {
      return;
    }

    this.intensity = lerp(
      this.intensity,
      this.intensityTarget,
      this.intensity < this.intensityTarget ? this.speedUp : this.speedDown
    );
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
