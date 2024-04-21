import { vec3 } from "gl-matrix";
import { Camera3d } from "./camera3d";

export class Rectangle3d {
  public size: number = 100;
  public radians: number = 0;
  public origin = vec3.create();

  /**
   * a --- b
   * |  x  |
   * d --- c
   */
  public a = vec3.create();
  public b = vec3.create();
  public c = vec3.create();
  public d = vec3.create();

  updatePosition() {
    const halfSize = this.size / 2;

    this.a[0] = this.origin[0] - halfSize;
    this.a[1] = this.origin[1];
    this.a[2] = this.origin[2] - halfSize;

    this.b[0] = this.origin[0] + halfSize;
    this.b[1] = this.origin[1];
    this.b[2] = this.origin[2] - halfSize;

    this.c[0] = this.origin[0] + halfSize;
    this.c[1] = this.origin[1];
    this.c[2] = this.origin[2] + halfSize;

    this.d[0] = this.origin[0] - halfSize;
    this.d[1] = this.origin[1];
    this.d[2] = this.origin[2] + halfSize;
  }

  updateRotation() {
    vec3.rotateY(this.a, this.a, this.origin, this.radians);
    vec3.rotateY(this.b, this.b, this.origin, this.radians);
    vec3.rotateY(this.c, this.c, this.origin, this.radians);
    vec3.rotateY(this.d, this.d, this.origin, this.radians);
  }

  drawPoints(g: Camera3d) {
    // todo: add dirty flag to not update every frame
    this.updatePosition();
    this.updateRotation();

    g.moveTo3d(this.a[0], this.a[1], this.a[2]);
    g.lineTo3d(this.b[0], this.b[1], this.b[2]);
    g.lineTo3d(this.c[0], this.c[1], this.c[2]);
    g.lineTo3d(this.d[0], this.d[1], this.d[2]);
    g.closePath();
  }
}
