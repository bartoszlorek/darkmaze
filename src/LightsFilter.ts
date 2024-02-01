import { defaultFilterVertex, Filter } from "@pixi/core";
import { Light } from "./lights";
import fragment from "./lightsShader.frag";

const VEC3_SIZE = 3;

export class LightsFilter extends Filter {
  lightsCount: number;

  constructor(lightsCount: number = 4) {
    /**
     * https://github.com/pixijs/pixijs/wiki/v5-Creating-filters#default-vertex-shader
     * https://github.com/pixijs/pixijs/blob/dev/packages/core/src/filters/defaultFilter.vert
     */
    super(defaultFilterVertex, fragment, {
      radius: 0,
      lights: new Float32Array(VEC3_SIZE * lightsCount),
    });

    this.lightsCount = lightsCount;
  }

  setRadius(value: number) {
    this.uniforms.radius = value;
  }

  setLights(lights: ReadonlyArray<Light>) {
    for (let i = 0; i < this.lightsCount; i++) {
      this.uniforms.lights[VEC3_SIZE * i] = lights[i].x;
      this.uniforms.lights[VEC3_SIZE * i + 2] = lights[i].intensity;
    }
  }
}
