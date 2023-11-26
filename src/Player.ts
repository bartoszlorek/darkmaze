import {
  DirectionIndex,
  DirectionAngle,
  angleDirectionIndex,
  normalizeAngle,
  lerp,
  lerpAngle,
} from "./math";
import { MazeFragment, WallState } from "./MazeFragment";

export const TURN_SPEED = 5; // degrees
export const MOVE_SPEED = 0.05; // pixels
export const MOVE_ALIGNMENT_BIAS = 0.3;

export class Player {
  public x: number;
  public y: number;
  public angle: number;

  // movement
  protected moveDirection: number = 0;
  protected turnDirection: number = 0;

  constructor(x: number, y: number, angle: number) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  moveForward() {
    this.moveDirection += 1;
  }

  moveBackward() {
    this.moveDirection -= 1;
  }

  turnRight() {
    this.turnDirection += 1;
  }

  turnLeft() {
    this.turnDirection -= 1;
  }

  update(fragment: MazeFragment) {
    if (this.turnDirection !== 0) {
      this.angle = normalizeAngle(this.angle + this.turnDirection * TURN_SPEED);
    }

    if (this.moveDirection !== 0) {
      const isForward = this.moveDirection > 0;
      const index = isForward
        ? angleDirectionIndex(this.angle)
        : angleDirectionIndex(this.angle + 180);

      let x = this.x;
      let y = this.y;

      switch (index) {
        case DirectionIndex.up:
          x = lerp(this.x, fragment.x, MOVE_ALIGNMENT_BIAS);
          y -= MOVE_SPEED;

          if (fragment.walls[DirectionIndex.up] === WallState.closed) {
            y = Math.max(y, fragment.y);
          }
          break;

        case DirectionIndex.right:
          x += MOVE_SPEED;
          y = lerp(this.y, fragment.y, MOVE_ALIGNMENT_BIAS);

          if (fragment.walls[DirectionIndex.right] === WallState.closed) {
            x = Math.min(x, fragment.x);
          }
          break;

        case DirectionIndex.down:
          x = lerp(this.x, fragment.x, MOVE_ALIGNMENT_BIAS);
          y += MOVE_SPEED;

          if (fragment.walls[DirectionIndex.down] === WallState.closed) {
            y = Math.min(y, fragment.y);
          }
          break;

        case DirectionIndex.left:
          x -= MOVE_SPEED;
          y = lerp(this.y, fragment.y, MOVE_ALIGNMENT_BIAS);

          if (fragment.walls[DirectionIndex.left] === WallState.closed) {
            x = Math.max(x, fragment.x);
          }
          break;
      }

      if (this.x !== x || this.y !== y) {
        switch (index) {
          case DirectionIndex.up:
            this.angle = lerpAngle(
              this.angle,
              isForward ? DirectionAngle.up : DirectionAngle.down,
              MOVE_ALIGNMENT_BIAS
            );
            break;

          case DirectionIndex.right:
            this.angle = lerpAngle(
              this.angle,
              isForward ? DirectionAngle.right : DirectionAngle.left,
              MOVE_ALIGNMENT_BIAS
            );
            break;

          case DirectionIndex.down:
            this.angle = lerpAngle(
              this.angle,
              isForward ? DirectionAngle.down : DirectionAngle.up,
              MOVE_ALIGNMENT_BIAS
            );
            break;

          case DirectionIndex.left:
            this.angle = lerpAngle(
              this.angle,
              isForward ? DirectionAngle.left : DirectionAngle.right,
              MOVE_ALIGNMENT_BIAS
            );
            break;
        }
      }

      this.x = x;
      this.y = y;
    }
  }
}
