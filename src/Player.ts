import {
  DirectionIndex,
  DirectionAngle,
  angleToIndex,
  normalizeAngle,
  lerp,
  lerpAngle,
} from "./math";
import { MazeFragment, WallState } from "./MazeFragment";

export const PLAYER_TURN_SPEED = 5; // degrees
export const PLAYER_MOVE_SPEED = 0.05; // pixels
export const PLAYER_ALIGNMENT_BIAS = 0.3;

export class Player {
  public x: number;
  public y: number;
  public angle: number;

  protected moveSpeed: number = 0;
  protected turnSpeed: number = 0;

  constructor(x: number, y: number, angle: number) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  moveForward() {
    this.moveSpeed += PLAYER_MOVE_SPEED;
  }

  moveBackward() {
    this.moveSpeed -= PLAYER_MOVE_SPEED;
  }

  turnRight() {
    this.turnSpeed += PLAYER_TURN_SPEED;
  }

  turnLeft() {
    this.turnSpeed -= PLAYER_TURN_SPEED;
  }

  update(fragment: MazeFragment) {
    if (this.turnSpeed !== 0) {
      this.angle = normalizeAngle(this.angle + this.turnSpeed);
    }

    if (this.moveSpeed !== 0) {
      const isForwardMove = this.moveSpeed > 0;
      const index = isForwardMove
        ? angleToIndex(this.angle)
        : angleToIndex(this.angle + 180);

      let x = this.x;
      let y = this.y;

      switch (index) {
        case DirectionIndex.up:
          x = lerp(this.x, fragment.x, PLAYER_ALIGNMENT_BIAS);
          y -= Math.abs(this.moveSpeed);

          if (fragment.walls[DirectionIndex.up] === WallState.closed) {
            y = Math.max(y, fragment.y);
          }
          break;

        case DirectionIndex.right:
          x += Math.abs(this.moveSpeed);
          y = lerp(this.y, fragment.y, PLAYER_ALIGNMENT_BIAS);

          if (fragment.walls[DirectionIndex.right] === WallState.closed) {
            x = Math.min(x, fragment.x);
          }
          break;

        case DirectionIndex.down:
          x = lerp(this.x, fragment.x, PLAYER_ALIGNMENT_BIAS);
          y += Math.abs(this.moveSpeed);

          if (fragment.walls[DirectionIndex.down] === WallState.closed) {
            y = Math.min(y, fragment.y);
          }
          break;

        case DirectionIndex.left:
          x -= Math.abs(this.moveSpeed);
          y = lerp(this.y, fragment.y, PLAYER_ALIGNMENT_BIAS);

          if (fragment.walls[DirectionIndex.left] === WallState.closed) {
            x = Math.max(x, fragment.x);
          }
          break;
      }

      // the player has traveled a certain distance
      if (this.x !== x || this.y !== y) {
        switch (index) {
          case DirectionIndex.up:
            this.angle = lerpAngle(
              this.angle,
              isForwardMove ? DirectionAngle.up : DirectionAngle.down,
              PLAYER_ALIGNMENT_BIAS
            );
            break;

          case DirectionIndex.right:
            this.angle = lerpAngle(
              this.angle,
              isForwardMove ? DirectionAngle.right : DirectionAngle.left,
              PLAYER_ALIGNMENT_BIAS
            );
            break;

          case DirectionIndex.down:
            this.angle = lerpAngle(
              this.angle,
              isForwardMove ? DirectionAngle.down : DirectionAngle.up,
              PLAYER_ALIGNMENT_BIAS
            );
            break;

          case DirectionIndex.left:
            this.angle = lerpAngle(
              this.angle,
              isForwardMove ? DirectionAngle.left : DirectionAngle.right,
              PLAYER_ALIGNMENT_BIAS
            );
            break;
        }
      }

      this.x = x;
      this.y = y;
    }
  }
}
