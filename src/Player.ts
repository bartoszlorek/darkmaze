import {
  DirectionAngle,
  DirectionIndex,
  angleFromDirectionIndex,
  directionIndexFromAngle,
  facingAngleFromAngle,
  lerp,
  lerpAngle,
  normalizeAngle,
  subtractAngle,
} from "./utils";
import { EventEmitter } from "./engine";
import { Room, WallState } from "./Room";

export const PLAYER_TURN_SPEED = 5; // degrees
export const PLAYER_MOVE_SPEED = 0.06; // pixels
export const PLAYER_MOVE_FOLLOWING_AXIS = 0.1;
export const PLAYER_MOVE_FOLLOWING_ANGLE = 0.3;
export const PLAYER_IDLE_ALIGNMENT = 0.02;
export const PLAYER_DEFAULT_STATUS: PlayerStatus = "idle";

export type PlayerEvents = {
  move: { x: number; y: number };
  turn: { angle: number };
  pathSense: { left: number; right: number };
  status: { value: PlayerStatus };
};

export type PlayerStatus =
  | "idle"
  | "running"
  | "entering"
  | "exiting"
  | "paused"
  | "died"
  | "won";

export class Player extends EventEmitter<PlayerEvents> {
  public x: number;
  public y: number;
  public angle: number;
  public status: PlayerStatus = PLAYER_DEFAULT_STATUS;

  // movement
  public moveDirection: number = 0;
  public turnDirection: number = 0;

  // detection of alternative level paths
  public pathSenseLeft: number = 0; // [0..1]
  public pathSenseRight: number = 0; // [0..1]

  // pre-allocated memory
  private _events: PlayerEvents = {
    move: { x: 0, y: 0 },
    turn: { angle: 0 },
    pathSense: { left: 0, right: 0 },
    status: { value: PLAYER_DEFAULT_STATUS },
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

  public setStatus(status: PlayerStatus) {
    if (this.status !== status) {
      this.status = status;
      this._events.status.value = status;
      this.emit("status", this._events.status);
    }
  }

  public update(deltaTime: number, currentRoom: Room) {
    // the player status switches between idle and running
    // automatically, other statuses must be handled manually
    if (this.status === "idle" || this.status === "running") {
      if (this.moveDirection !== 0 || this.turnDirection !== 0) {
        this.setStatus("running");
        this.applyMovement(deltaTime, currentRoom);
      } else {
        this.setStatus("idle");

        // align the angle to the facing angle of the player
        const alignedAngle = facingAngleFromAngle(this.angle);
        if (alignedAngle !== this.angle) {
          this.angle = lerpAngle(
            this.angle,
            alignedAngle,
            PLAYER_IDLE_ALIGNMENT
          );

          this._events.turn.angle = this.angle;
          this.emit("turn", this._events.turn);
        }
      }

      // after all movement operations
      this.applyPathSense(currentRoom);
    }
  }

  protected applyMovement(deltaTime: number, currentRoom: Room) {
    let nextX = this.x;
    let nextY = this.y;
    let nextAngle = this.angle;
    let didSomeDistance = false;

    if (this.moveDirection !== 0) {
      const isMovingForward = this.moveDirection > 0;
      const index = currentRoom.directionIndexFromAngle(
        isMovingForward ? this.angle : normalizeAngle(this.angle + 180)
      );

      // the other axis and the angle should follow
      // the movement in the given direction
      switch (index) {
        case DirectionIndex.up:
          nextY -= PLAYER_MOVE_SPEED * deltaTime;

          if (currentRoom.walls[DirectionIndex.up] === WallState.closed) {
            nextY = Math.max(nextY, currentRoom.y);
          }

          if (nextY !== this.y) {
            nextX = lerp(nextX, currentRoom.x, PLAYER_MOVE_FOLLOWING_AXIS);
            nextAngle = lerpAngle(
              nextAngle,
              isMovingForward ? DirectionAngle.up : DirectionAngle.down,
              PLAYER_MOVE_FOLLOWING_ANGLE
            );
          }
          break;

        case DirectionIndex.right:
          nextX += PLAYER_MOVE_SPEED * deltaTime;

          if (currentRoom.walls[DirectionIndex.right] === WallState.closed) {
            nextX = Math.min(nextX, currentRoom.x);
          }

          if (nextX !== this.x) {
            nextY = lerp(nextY, currentRoom.y, PLAYER_MOVE_FOLLOWING_AXIS);
            nextAngle = lerpAngle(
              nextAngle,
              isMovingForward ? DirectionAngle.right : DirectionAngle.left,
              PLAYER_MOVE_FOLLOWING_ANGLE
            );
          }
          break;

        case DirectionIndex.down:
          nextY += PLAYER_MOVE_SPEED * deltaTime;

          if (currentRoom.walls[DirectionIndex.down] === WallState.closed) {
            nextY = Math.min(nextY, currentRoom.y);
          }

          if (nextY !== this.y) {
            nextX = lerp(nextX, currentRoom.x, PLAYER_MOVE_FOLLOWING_AXIS);
            nextAngle = lerpAngle(
              nextAngle,
              isMovingForward ? DirectionAngle.down : DirectionAngle.up,
              PLAYER_MOVE_FOLLOWING_ANGLE
            );
          }
          break;

        case DirectionIndex.left:
          nextX -= PLAYER_MOVE_SPEED * deltaTime;

          if (currentRoom.walls[DirectionIndex.left] === WallState.closed) {
            nextX = Math.max(nextX, currentRoom.x);
          }

          if (nextX !== this.x) {
            nextY = lerp(nextY, currentRoom.y, PLAYER_MOVE_FOLLOWING_AXIS);
            nextAngle = lerpAngle(
              nextAngle,
              isMovingForward ? DirectionAngle.left : DirectionAngle.right,
              PLAYER_MOVE_FOLLOWING_ANGLE
            );
          }
          break;
      }

      didSomeDistance = nextX !== this.x || nextY !== this.y;
      if (didSomeDistance) {
        this.x = nextX;
        this.y = nextY;
        this._events.move.x = nextX;
        this._events.move.y = nextY;
        this.emit("move", this._events.move);
      }
    }

    // the move has higher priority than rotation
    if (!didSomeDistance && this.turnDirection !== 0) {
      const turnSpeed = this.turnDirection * PLAYER_TURN_SPEED * deltaTime;
      nextAngle = normalizeAngle(nextAngle + turnSpeed);
    }

    if (nextAngle !== this.angle) {
      this.angle = nextAngle;
      this._events.turn.angle = nextAngle;
      this.emit("turn", this._events.turn);
    }
  }

  protected applyPathSense(currentRoom: Room) {
    let pathSenseLeft = this.pathSenseLeft;
    let pathSenseRight = this.pathSenseRight;

    const angleLeft = this.angle - 90;
    const angleRight = this.angle + 90;
    const indexLeft = directionIndexFromAngle(angleLeft);
    const indexRight = directionIndexFromAngle(angleRight);

    if (currentRoom.walls[indexLeft] === WallState.open) {
      const angleDiff = subtractAngle(
        angleFromDirectionIndex(indexLeft),
        angleLeft
      );

      pathSenseLeft = (45 - Math.abs(angleDiff)) / 45;
    } else {
      pathSenseLeft = 0;
    }

    if (currentRoom.walls[indexRight] === WallState.open) {
      const angleDiff = subtractAngle(
        angleFromDirectionIndex(indexRight),
        angleRight
      );

      pathSenseRight = (45 - Math.abs(angleDiff)) / 45;
    } else {
      pathSenseRight = 0;
    }

    if (
      pathSenseLeft !== this.pathSenseLeft ||
      pathSenseRight !== this.pathSenseRight
    ) {
      this.pathSenseLeft = pathSenseLeft;
      this.pathSenseRight = pathSenseRight;
      this._events.pathSense.left = pathSenseLeft;
      this._events.pathSense.right = pathSenseRight;
      this.emit("pathSense", this._events.pathSense);
    }
  }
}
