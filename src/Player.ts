import {
  DirectionIndex,
  DirectionAngle,
  angleToIndex,
  normalizeAngle,
  lerp,
  lerpAngle,
} from "./utils";
import { EventEmitter } from "./EventEmitter";
import { Room, WallState } from "./Room";

export const PLAYER_TURN_SPEED = 5; // degrees
export const PLAYER_MOVE_SPEED = 0.05; // pixels
export const PLAYER_ALIGNMENT_BIAS = 0.3;

export type PlayerEvents = {
  move: { x: number; y: number };
  turn: { angle: number };
  path: { diffAngle: number; diffFactor: number };
};

export class Player extends EventEmitter<PlayerEvents> {
  public x: number;
  public y: number;
  public angle: number;

  // movement
  public moveDirection: number = 0;
  public turnDirection: number = 0;

  // environment
  public pathDiffAngle: number = 0; // [-180..180]
  public pathDiffFactor: number = 0; // [-1..1]

  // allocated memory
  protected events: PlayerEvents = {
    move: { x: 0, y: 0 },
    turn: { angle: 0 },
    path: { diffAngle: 0, diffFactor: 0 },
  };

  constructor(x: number, y: number, angle: number) {
    super();
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

  public update(deltaTime: number, currentRoom: Room) {
    this.applyMovement(deltaTime, currentRoom);

    const diffAngle = currentRoom.closestOpenWallDiffAngle(this.angle);
    if (diffAngle !== undefined) {
      const diffFactor = diffAngle / 180;

      if (this.pathDiffAngle !== diffAngle) {
        this.events.path.diffAngle = diffAngle;
        this.events.path.diffFactor = diffFactor;
        this.emit("path", this.events.path);
      }

      this.pathDiffAngle = diffAngle;
      this.pathDiffFactor = diffFactor;
    }
  }

  protected applyMovement(deltaTime: number, currentRoom: Room) {
    const angleBefore = this.angle;
    const moveSpeed = this.moveDirection * PLAYER_MOVE_SPEED * deltaTime;
    const turnSpeed = this.turnDirection * PLAYER_TURN_SPEED * deltaTime;
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

        this.events.move.x = x;
        this.events.move.y = y;
        this.emit("move", this.events.move);
      }

      this.x = x;
      this.y = y;
    }

    // the move has higher priority than rotation
    if (!didSomeDistance && turnSpeed !== 0) {
      this.angle = normalizeAngle(this.angle + turnSpeed);
    }

    if (angleBefore !== this.angle) {
      this.events.turn.angle = this.angle;
      this.emit("turn", this.events.turn);
    }
  }
}
