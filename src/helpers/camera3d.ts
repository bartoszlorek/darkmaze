import * as PIXI from "pixi.js";
import { vec3, mat4, ReadonlyVec3, ReadonlyMat4 } from "gl-matrix";

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
    transformMat4(p, p, this.projectionMatrix);
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

// https://stackoverflow.com/questions/7604322/clip-matrix-for-3d-perspective-projection
function transformMat4(out: vec3, a: ReadonlyVec3, m: ReadonlyMat4): vec3 {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  let w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1.0;

  // It stops points before moving them behind the camera,
  // instead of clipping a line. I don't know how to do it
  // better at the moment.
  if (w < 0) {
    w = 0.00001;
  }

  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}
