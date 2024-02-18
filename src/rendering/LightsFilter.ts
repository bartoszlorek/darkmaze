import { defaultFilterVertex, Filter } from "@pixi/core";
import { lerp } from "../helpers";
import fragment from "./lightsShader.frag";

export interface LightOptions {
  changeUpDelay: number;
  changeUpSpeed: number; // [0..1]
  changeDownDelay: number;
  changeDownSpeed: number; // [0..1]
}

export class Light {
  public x: number = 0;
  public radius: number = 0;
  public options: LightOptions;

  // dynamic intensity
  protected currentIntensity: number = 0;
  protected targetIntensity: number = 0;
  protected speed: number = 0;
  protected delay: number = 0;

  constructor(options: Partial<LightOptions> = {}) {
    this.options = {
      changeUpDelay: 0,
      changeUpSpeed: 0.1,
      changeDownDelay: 0,
      changeDownSpeed: 0.008,
      ...options,
    };
  }

  get intensity() {
    return this.currentIntensity;
  }

  set intensity(value: number) {
    this.targetIntensity = value;

    if (this.currentIntensity < this.targetIntensity) {
      this.speed = this.options.changeUpSpeed;
      this.delay = this.options.changeUpDelay;
    } else if (this.currentIntensity > this.targetIntensity) {
      this.speed = this.options.changeDownSpeed;
      this.delay = this.options.changeDownDelay;
    }
  }

  update(deltaTime: number) {
    if (this.currentIntensity === this.targetIntensity) {
      return;
    }

    this.delay = Math.max(0, this.delay - deltaTime);
    if (this.delay > 0) {
      return;
    }

    this.currentIntensity = lerp(
      this.currentIntensity,
      this.targetIntensity,
      this.speed
    );
  }

  toVector3Array(output: number[], startIndex: number) {
    output[startIndex + 0] = this.x;
    output[startIndex + 1] = this.radius;
    output[startIndex + 2] = this.intensity;
    return output;
  }
}

export class LightsFilter extends Filter {
  /**
   * ```
   * vec3(
   *   x,
   *   radius,
   *   intensity,
   * )
   * ```
   */
  static readonly attributesCount = 3;

  readonly lightsCount: number;

  constructor(lightsCount: number) {
    /**
     * https://www.khronos.org/opengl/wiki/Uniform_(GLSL)
     */
    const uniforms = {
      lights: new Float32Array(lightsCount * LightsFilter.attributesCount),
    };

    /**
     * https://github.com/pixijs/pixijs/wiki/v5-Creating-filters#default-vertex-shader
     * https://github.com/pixijs/pixijs/blob/dev/packages/core/src/filters/defaultFilter.vert
     */
    super(defaultFilterVertex, fragment, uniforms);
    this.lightsCount = lightsCount;
  }

  update(lights: Light[]) {
    if (lights.length !== this.lightsCount) {
      throw new Error(
        `filter expects ${this.lightsCount} lights but received ${lights.length}`
      );
    }

    for (let i = 0; i < this.lightsCount; i++) {
      lights[i].toVector3Array(
        this.uniforms.lights,
        i * LightsFilter.attributesCount
      );
    }
  }
}
