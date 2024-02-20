import {
  Direction4Angle,
  ceilNumber,
  floorNumber,
  lerp,
  lerpAngle,
  normalizeAngle,
  subtractAngle,
} from "../helpers";
import { EventEmitter } from "./EventEmitter";
import { Room } from "./Room";

export const PLAYER_MOVE_SPEED = 0.05; // pixels
export const PLAYER_MOVE_FOLLOWING_AXIS = 0.1; // bias
export const PLAYER_FACING_ANGLE = 45;
export const PLAYER_TURN_SPEED = 5; // degrees
export const PLAYER_TURN_ALIGNMENT = 0.05; // bias
export const PLAYER_TURN_AUTOMATIC = 0.2; // bias
export const PLAYER_DEFAULT_STATUS: PlayerStatus = "idle";

export type PlayerEvents = {
  move: { x: number; y: number };
  turn: { angle: number };
  status: { value: PlayerStatus };
};

export type PlayerStatus =
  | "idle"
  | "running"
  | "turning"
  | "entering"
  | "exiting"
  | "paused"
  | "died"
  | "won";

export class Player extends EventEmitter<PlayerEvents> {
  public x: number;
  public y: number;
  public angle: number;
  public targetAngle: number;
  public facingAngle: number;
  public status: PlayerStatus = PLAYER_DEFAULT_STATUS;

  // movement
  public moveDirection: number = 0;
  public turnDirection: number = 0;

  // pre-allocated memory
  private _events: PlayerEvents = {
    move: { x: 0, y: 0 },
    turn: { angle: 0 },
    status: { value: PLAYER_DEFAULT_STATUS },
  };

  protected prevFacingAngle: number;

  constructor(x: number, y: number, angle: number) {
    super();
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.targetAngle = angle;
    this.facingAngle = floorNumber(angle, PLAYER_FACING_ANGLE);
    this.prevFacingAngle = this.facingAngle;
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

  public rotateBy(value: number) {
    this.targetAngle = normalizeAngle(this.angle + value);
  }

  public setStatus(status: PlayerStatus) {
    if (this.status !== status) {
      this.status = status;
      this._events.status.value = status;
      this.emit("status", this._events.status);
    }
  }

  public update(deltaTime: number, currentRoom: Room) {
    // the player status switches between idle, running, and turning
    // automatically, other statuses must be handled manually
    if (
      this.status === "idle" ||
      this.status === "running" ||
      this.status === "turning"
    ) {
      this.applyMovement(deltaTime, currentRoom);
    }
  }

  protected applyMovement(deltaTime: number, currentRoom: Room) {
    let didSomeMove = false;
    let didSomeTurn = false;

    // references
    const xBefore = this.x;
    const yBefore = this.y;
    const angleBefore = this.angle;
    const facingAngleBefore = this.facingAngle;

    if (this.moveDirection !== 0) {
      const isMovingForward = this.moveDirection > 0;
      const directionKey = currentRoom.direction(
        isMovingForward
          ? this.facingAngle
          : normalizeAngle(this.facingAngle + 180),
        isMovingForward
          ? this.prevFacingAngle
          : normalizeAngle(this.prevFacingAngle + 180)
      );

      switch (directionKey) {
        case "up":
          this.y -= PLAYER_MOVE_SPEED * deltaTime;

          if (currentRoom.walls.up) {
            this.y = Math.max(this.y, currentRoom.y);
          }

          if (this.y !== yBefore) {
            this.x = lerp(this.x, currentRoom.x, PLAYER_MOVE_FOLLOWING_AXIS);
            this.facingAngle = isMovingForward
              ? Direction4Angle.up
              : Direction4Angle.down;
          }
          break;

        case "right":
          this.x += PLAYER_MOVE_SPEED * deltaTime;

          if (currentRoom.walls.right) {
            this.x = Math.min(this.x, currentRoom.x);
          }

          if (this.x !== xBefore) {
            this.y = lerp(this.y, currentRoom.y, PLAYER_MOVE_FOLLOWING_AXIS);
            this.facingAngle = isMovingForward
              ? Direction4Angle.right
              : Direction4Angle.left;
          }
          break;

        case "down":
          this.y += PLAYER_MOVE_SPEED * deltaTime;

          if (currentRoom.walls.down) {
            this.y = Math.min(this.y, currentRoom.y);
          }

          if (this.y !== yBefore) {
            this.x = lerp(this.x, currentRoom.x, PLAYER_MOVE_FOLLOWING_AXIS);
            this.facingAngle = isMovingForward
              ? Direction4Angle.down
              : Direction4Angle.up;
          }
          break;

        case "left":
          this.x -= PLAYER_MOVE_SPEED * deltaTime;

          if (currentRoom.walls.left) {
            this.x = Math.max(this.x, currentRoom.x);
          }

          if (this.x !== xBefore) {
            this.y = lerp(this.y, currentRoom.y, PLAYER_MOVE_FOLLOWING_AXIS);
            this.facingAngle = isMovingForward
              ? Direction4Angle.left
              : Direction4Angle.right;
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

    // automatic rotation
    if (this.angle !== this.targetAngle) {
      this.angle = normalizeAngle(
        lerpAngle(this.angle, this.targetAngle, PLAYER_TURN_AUTOMATIC)
      );
      this.facingAngle =
        subtractAngle(this.targetAngle, this.angle) > 0
          ? ceilNumber(this.angle, PLAYER_FACING_ANGLE)
          : floorNumber(this.angle, PLAYER_FACING_ANGLE);
    }

    // manual rotation
    else if (this.turnDirection !== 0) {
      const velocity = this.turnDirection * PLAYER_TURN_SPEED * deltaTime;
      this.angle = this.targetAngle = normalizeAngle(this.angle + velocity);
      this.facingAngle =
        this.turnDirection > 0
          ? ceilNumber(this.angle, PLAYER_FACING_ANGLE)
          : floorNumber(this.angle, PLAYER_FACING_ANGLE);
    }

    // damping effect
    else {
      this.angle = this.targetAngle = lerpAngle(
        this.angle,
        this.facingAngle,
        PLAYER_TURN_ALIGNMENT
      );
    }

    if (this.facingAngle !== facingAngleBefore) {
      this.prevFacingAngle = facingAngleBefore;
    }

    didSomeTurn = this.angle !== angleBefore;
    if (didSomeTurn) {
      this._events.turn.angle = this.angle;
      this.emit("turn", this._events.turn);
    }

    if (didSomeMove) {
      this.setStatus("running");
    } else if (didSomeTurn) {
      this.setStatus("turning");
    } else {
      this.setStatus("idle");
    }
  }
}
