import {
  DirectionIndex,
  DirectionAngle,
  angleToIndex,
  normalizeAngle,
  lerp,
  lerpAngle,
} from "./math";
import { Room, WallState } from "./Room";

export const PLAYER_TURN_SPEED = 4; // degrees
export const PLAYER_MOVE_SPEED = 0.03; // pixels
export const PLAYER_ALIGNMENT_BIAS = 0.3;

export class Player {
  public x: number;
  public y: number;
  public angle: number;

  // movement
  protected moveSpeed: number = 0;
  protected turnSpeed: number = 0;

  constructor(x: number, y: number, angle: number) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  public moveForward() {
    this.moveSpeed += PLAYER_MOVE_SPEED;
  }

  public moveBackward() {
    this.moveSpeed -= PLAYER_MOVE_SPEED;
  }

  public turnRight() {
    this.turnSpeed += PLAYER_TURN_SPEED;
  }

  public turnLeft() {
    this.turnSpeed -= PLAYER_TURN_SPEED;
  }

  public update(currentRoom: Room) {
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
          x = lerp(this.x, currentRoom.x, PLAYER_ALIGNMENT_BIAS);
          y -= Math.abs(this.moveSpeed);

          if (currentRoom.walls[DirectionIndex.up] === WallState.closed) {
            y = Math.max(y, currentRoom.y);
          }
          break;

        case DirectionIndex.right:
          x += Math.abs(this.moveSpeed);
          y = lerp(this.y, currentRoom.y, PLAYER_ALIGNMENT_BIAS);

          if (currentRoom.walls[DirectionIndex.right] === WallState.closed) {
            x = Math.min(x, currentRoom.x);
          }
          break;

        case DirectionIndex.down:
          x = lerp(this.x, currentRoom.x, PLAYER_ALIGNMENT_BIAS);
          y += Math.abs(this.moveSpeed);

          if (currentRoom.walls[DirectionIndex.down] === WallState.closed) {
            y = Math.min(y, currentRoom.y);
          }
          break;

        case DirectionIndex.left:
          x -= Math.abs(this.moveSpeed);
          y = lerp(this.y, currentRoom.y, PLAYER_ALIGNMENT_BIAS);

          if (currentRoom.walls[DirectionIndex.left] === WallState.closed) {
            x = Math.max(x, currentRoom.x);
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
