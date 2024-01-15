import * as React from "react";
import { getPointInView, angleBetweenPoints, floorNumber } from "../helpers";
import { CompassDirectionPoint } from "./CompassDirectionPoint";
import { CompassEvilPoint } from "./CompassEvilPoint";
import { CompassGoldenPoint } from "./CompassGoldenPoint";
import { Level, Player, Room, isEvil } from "../core";
import styles from "./Compass.module.scss";

const directionsPoints = [
  { label: "N", angle: 0 },
  { label: "S", angle: 180 },
  { label: "E", angle: 90 },
  { label: "W", angle: 270 },
];

type PropsType = Readonly<{
  player: Player;
  level: Level;
}>;

export function Compass({ player, level }: PropsType) {
  const [playerX, setPlayerX] = React.useState(player.x);
  const [playerY, setPlayerY] = React.useState(player.y);
  const [playerAngle, setPlayerAngle] = React.useState(player.angle);

  /**
   * a dynamic list of rooms
   */
  const [nearbyEvilRooms, setNearbyEvilRooms] = React.useState<Room[]>([]);

  /**
   * a static list of rooms
   */
  const goldenRooms = React.useMemo<Room[]>(() => {
    const matches = [];
    for (const room of level.rooms.values()) {
      if (room.value.type === "golden") {
        matches.push(room.value);
      }
    }
    return matches;
  }, [level]);

  React.useEffect(() => {
    const unsubscribeMove = player.subscribe("move", (payload) => {
      setPlayerX(payload.x);
      setPlayerY(payload.y);
    });

    const unsubscribeTurn = player.subscribe("turn", (payload) => {
      setPlayerAngle(payload.angle);
    });

    const unsubscribeRoomEnter = level.subscribe("room_enter", ({ room }) => {
      setNearbyEvilRooms(level.filterConnectedRooms(room, isEvil));
    });

    return () => {
      unsubscribeMove();
      unsubscribeTurn();
      unsubscribeRoomEnter();
    };
  }, [player, level]);

  return (
    <div className={styles.track}>
      {directionsPoints.map((point) => (
        <CompassDirectionPoint
          key={point.label}
          label={point.label}
          value={getCompassPointInView(playerAngle, point.angle)}
        />
      ))}
      {goldenRooms.map((room, i) => (
        <CompassGoldenPoint
          key={i}
          value={getCompassPointInView(
            playerAngle,
            angleBetweenPoints(playerX, playerY, room.x, room.y)
          )}
        />
      ))}
      {nearbyEvilRooms.map((room, i) => (
        <CompassEvilPoint
          key={i}
          value={getCompassPointInView(
            playerAngle,
            angleBetweenPoints(playerX, playerY, room.x, room.y)
          )}
        />
      ))}
    </div>
  );
}

function getCompassPointInView(a: number, b: number) {
  return getPointInView(floorNumber(a, 10), floorNumber(b, 10), 200);
}
