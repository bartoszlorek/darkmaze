import * as PIXI from "pixi.js";
import { vec3, mat4 } from "gl-matrix";

/**
 * @see https://webglfundamentals.org/webgl/lessons/webgl-3d-perspective.html
 * @see https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/projection-matrices-what-you-need-to-know-first.html
 */
export class Camera3d extends PIXI.Graphics {
  protected projectionMatrix = mat4.create();
  protected tempPointVector = vec3.create();

  constructor() {
    super();
  }

  setPerspective(focus: number, near: number, far: number) {
    // https://github.com/pixijs/pixi-projection/blob/master/src/proj3d/Camera3d.ts
    // https://stackoverflow.com/questions/30429523/webgl-perspective-projection-matrix
    const m = this.projectionMatrix;
    m[10] = 1.0 / (far - near);
    m[14] = (focus - near) / (far - near);
    m[11] = 1.0 / focus;
    return this;
  }

  transformPoint(x: number, y: number, z: number) {
    const p = this.tempPointVector;
    p[0] = x;
    p[1] = y;
    p[2] = z;
    vec3.transformMat4(p, p, this.projectionMatrix);
    return p;
  }

  moveTo3d(x: number, y: number, z: number) {
    const [px, py] = this.transformPoint(x, y, z);
    this.moveTo(px, py);
    return this;
  }

  lineTo3d(x: number, y: number, z: number) {
    const [px, py] = this.transformPoint(x, y, z);
    this.lineTo(px, py);
    return this;
  }
}
