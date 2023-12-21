import {
  ceilNumber,
  floorNumber,
  normalizeAngle,
  subtractAngle,
  lerp,
  lerpAngle,
  DirectionIndex,
  DirectionAngle,
  angleFromDirectionIndex,
  directionIndexFromAngle,
} from "../helpers";
import { EventEmitter } from "./EventEmitter";
import { Room, WallState } from "./Room";

export const PLAYER_MOVE_SPEED = 0.06; // pixels
export const PLAYER_MOVE_FOLLOWING_AXIS = 0.1; // bias
export const PLAYER_FACING_ANGLE = 45;
export const PLAYER_TURN_SPEED = 5; // degrees
export const PLAYER_TURN_ALIGNMENT = 0.05; // bias
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
  public facingAngle: number;
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
    this.facingAngle = floorNumber(angle, PLAYER_FACING_ANGLE);
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
      this.applyMovement(deltaTime, currentRoom);
      this.applyPathSense(currentRoom);
    }
  }

  protected applyMovement(deltaTime: number, currentRoom: Room) {
    let didSomeMove = false;
    let didSomeTurn = false;

    // references
    const xBefore = this.x;
    const yBefore = this.y;
    const angleBefore = this.angle;

    if (this.moveDirection !== 0) {
      const isMovingForward = this.moveDirection > 0;
      const directionIndex = currentRoom.directionIndexFromAngle(
        isMovingForward
          ? this.facingAngle
          : normalizeAngle(this.facingAngle + 180)
      );

      switch (directionIndex) {
        case DirectionIndex.up:
          this.y -= PLAYER_MOVE_SPEED * deltaTime;

          if (currentRoom.walls[DirectionIndex.up] === WallState.closed) {
            this.y = Math.max(this.y, currentRoom.y);
          }

          if (this.y !== yBefore) {
            this.x = lerp(this.x, currentRoom.x, PLAYER_MOVE_FOLLOWING_AXIS);
            this.facingAngle = isMovingForward
              ? DirectionAngle.up
              : DirectionAngle.down;
          }
          break;

        case DirectionIndex.right:
          this.x += PLAYER_MOVE_SPEED * deltaTime;

          if (currentRoom.walls[DirectionIndex.right] === WallState.closed) {
            this.x = Math.min(this.x, currentRoom.x);
          }

          if (this.x !== xBefore) {
            this.y = lerp(this.y, currentRoom.y, PLAYER_MOVE_FOLLOWING_AXIS);
            this.facingAngle = isMovingForward
              ? DirectionAngle.right
              : DirectionAngle.left;
          }
          break;

        case DirectionIndex.down:
          this.y += PLAYER_MOVE_SPEED * deltaTime;

          if (currentRoom.walls[DirectionIndex.down] === WallState.closed) {
            this.y = Math.min(this.y, currentRoom.y);
          }

          if (this.y !== yBefore) {
            this.x = lerp(this.x, currentRoom.x, PLAYER_MOVE_FOLLOWING_AXIS);
            this.facingAngle = isMovingForward
              ? DirectionAngle.down
              : DirectionAngle.up;
          }
          break;

        case DirectionIndex.left:
          this.x -= PLAYER_MOVE_SPEED * deltaTime;

          if (currentRoom.walls[DirectionIndex.left] === WallState.closed) {
            this.x = Math.max(this.x, currentRoom.x);
          }

          if (this.x !== xBefore) {
            this.y = lerp(this.y, currentRoom.y, PLAYER_MOVE_FOLLOWING_AXIS);
            this.facingAngle = isMovingForward
              ? DirectionAngle.left
              : DirectionAngle.right;
          }
          break;
      }

      didSomeMove = this.x !== xBefore || this.y !== yBefore;
      if (didSomeMove) {
        this._events.move.x = this.x;
        this._events.move.y = this.y;
        this.emit("move", this._events.move);
      }
    }

    if (!didSomeMove && this.turnDirection !== 0) {
      const velocity = this.turnDirection * PLAYER_TURN_SPEED * deltaTime;

      this.angle = normalizeAngle(this.angle + velocity);
      this.facingAngle =
        this.turnDirection > 0
          ? ceilNumber(this.angle, PLAYER_FACING_ANGLE)
          : floorNumber(this.angle, PLAYER_FACING_ANGLE);
    } else {
      this.angle = lerpAngle(
        this.angle,
        this.facingAngle,
        PLAYER_TURN_ALIGNMENT
      );
    }

    didSomeTurn = this.angle !== angleBefore;
    if (didSomeTurn) {
      this._events.turn.angle = this.angle;
      this.emit("turn", this._events.turn);
    }

    if (didSomeMove || didSomeTurn) {
      this.setStatus("running");
    } else {
      this.setStatus("idle");
    }
  }

  protected applyPathSense(currentRoom: Room) {
    const angleLeft = this.facingAngle - 90;
    const angleRight = this.facingAngle + 90;
    const directionIndexLeft = directionIndexFromAngle(angleLeft);
    const directionIndexRight = directionIndexFromAngle(angleRight);

    // references
    const pathSenseLeftBefore = this.pathSenseLeft;
    const pathSenseRightBefore = this.pathSenseRight;

    if (currentRoom.walls[directionIndexLeft] === WallState.open) {
      const angleDiff = subtractAngle(
        angleFromDirectionIndex(directionIndexLeft),
        angleLeft
      );

      this.pathSenseLeft = (45 - Math.abs(angleDiff)) / 45;
    } else {
      this.pathSenseLeft = 0;
    }

    if (currentRoom.walls[directionIndexRight] === WallState.open) {
      const angleDiff = subtractAngle(
        angleFromDirectionIndex(directionIndexRight),
        angleRight
      );

      this.pathSenseRight = (45 - Math.abs(angleDiff)) / 45;
    } else {
      this.pathSenseRight = 0;
    }

    if (
      this.pathSenseLeft !== pathSenseLeftBefore ||
      this.pathSenseRight !== pathSenseRightBefore
    ) {
      this._events.pathSense.left = this.pathSenseLeft;
      this._events.pathSense.right = this.pathSenseRight;
      this.emit("pathSense", this._events.pathSense);
    }
  }
}
