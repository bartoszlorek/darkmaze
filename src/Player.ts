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
  public moveDirection: number = 0;
  public turnDirection: number = 0;

  // environment
  public correctPathDiffAngle: number = 0; // [-180..180]
  public correctPathDiffFactor: number = 0; // [-1..1]

  constructor(x: number, y: number, angle: number) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  public moveForward() {
    this.moveDirection += 1;
  }

  public moveBackward() {
    this.moveDirection -= 1;
  }

  public turnRight() {
    this.turnDirection += 1;
  }

  public turnLeft() {
    this.turnDirection -= 1;
  }

  public update(currentRoom: Room) {
    this.applyMovement(currentRoom);

    const diffAngle = currentRoom.closestOpenWallDiffAngle(this.angle);
    if (diffAngle !== undefined) {
      this.correctPathDiffAngle = diffAngle;
      this.correctPathDiffFactor = diffAngle / 180;
    }
  }

  protected applyMovement(currentRoom: Room) {
    const moveSpeed = this.moveDirection * PLAYER_MOVE_SPEED;
    const turnSpeed = this.turnDirection * PLAYER_TURN_SPEED;
    let didSomeDistance = false;

    if (moveSpeed !== 0) {
      const isForwardMove = moveSpeed > 0;
      const index = isForwardMove
        ? angleToIndex(this.angle)
        : angleToIndex(this.angle + 180);

      let x = this.x;
      let y = this.y;

      switch (index) {
        case DirectionIndex.up:
          y -= Math.abs(moveSpeed);

          if (currentRoom.walls[DirectionIndex.up] === WallState.closed) {
            y = Math.max(y, currentRoom.y);
          }
          if (this.y !== y) {
            x = lerp(this.x, currentRoom.x, PLAYER_ALIGNMENT_BIAS);
          }
          break;

        case DirectionIndex.right:
          x += Math.abs(moveSpeed);

          if (currentRoom.walls[DirectionIndex.right] === WallState.closed) {
            x = Math.min(x, currentRoom.x);
          }
          if (this.x !== x) {
            y = lerp(this.y, currentRoom.y, PLAYER_ALIGNMENT_BIAS);
          }
          break;

        case DirectionIndex.down:
          y += Math.abs(moveSpeed);

          if (currentRoom.walls[DirectionIndex.down] === WallState.closed) {
            y = Math.min(y, currentRoom.y);
          }
          if (this.y !== y) {
            x = lerp(this.x, currentRoom.x, PLAYER_ALIGNMENT_BIAS);
          }
          break;

        case DirectionIndex.left:
          x -= Math.abs(moveSpeed);

          if (currentRoom.walls[DirectionIndex.left] === WallState.closed) {
            x = Math.max(x, currentRoom.x);
          }
          if (this.x !== x) {
            y = lerp(this.y, currentRoom.y, PLAYER_ALIGNMENT_BIAS);
          }
          break;
      }

      didSomeDistance = this.x !== x || this.y !== y;
      if (didSomeDistance) {
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

    // the move has higher priority than rotation
    if (!didSomeDistance && turnSpeed !== 0) {
      this.angle = normalizeAngle(this.angle + turnSpeed);
    }
  }
}
