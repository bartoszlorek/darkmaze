import * as PIXI from "pixi.js";
import { Player, Level, Room } from "../core";
import { LoadedSpritesheets } from "../assets";
import {
  Pool,
  getPointInView,
  angleBetweenPoints,
  floorNumber,
  Direction4Angle,
} from "../helpers";
import { DrawFunction } from "./draw";
import { FrameBounds } from "./FrameBounds";

const textStyles: Partial<PIXI.ITextStyle> = {
  fill: 0xd4e2cc,
  fontSize: 16,
  fontFamily: "monospace",
  align: "center",
};

export const drawCompass: DrawFunction<{
  player: Player;
  level: Level;
  frame: FrameBounds;
  tileSize: number;
  sprites: LoadedSpritesheets;
}> = ({ parent, player, level, frame, tileSize, sprites }) => {
  const trackLayer = new PIXI.Container();
  const pointsLayer = new PIXI.Container();
  parent.addChild(trackLayer);
  parent.addChild(pointsLayer);

  const trackRefs = new Pool(
    () => {
      const sprite = new PIXI.Sprite();
      sprite.y = frame.top;
      return trackLayer.addChild(sprite);
    },
    (sprite) => sprite.destroy()
  );

  const pointsRefs = new Pool(
    () => {
      const sprite = new PIXI.Sprite();
      sprite.y = frame.top;
      return pointsLayer.addChild(sprite);
    },
    (sprite) => sprite.destroy()
  );

  const textsRefs = new Pool(
    () => {
      const text = new PIXI.Text("", textStyles);
      text.y = frame.top;
      text.anchor.set(0.5);
      return pointsLayer.addChild(text);
    },
    (sprite) => sprite.destroy()
  );

  const goldenRooms: Room[] = [];
  for (const room of level.rooms.values()) {
    if (Room.isGolden(room.value)) {
      goldenRooms.push(room.value);
    }
  }

  let tilesCount = 0;
  let width = 0;
  let margin = 0;

  const getPointX = (value: number) => {
    return frame.left + margin + value * (width - tileSize);
  };

  const updateTrack = () => {
    tilesCount = Math.floor(Math.min(500, frame.width * 0.6) / tileSize);
    width = tilesCount * tileSize;
    margin = Math.round((frame.width - width) / 2);

    const left = trackRefs.get("left");
    left.texture = sprites.frame.textures["compass_left"];
    left.x = frame.left + margin;

    const right = trackRefs.get("right");
    right.texture = sprites.frame.textures["compass_right"];
    right.x = frame.left + margin + width - tileSize;

    for (let i = 1; i < tilesCount - 1; i++) {
      const mid = trackRefs.get(`mid_${i}`);
      mid.texture = sprites.frame.textures["compass_mid"];
      mid.x = frame.left + margin + i * tileSize;
    }

    trackRefs.afterAll();
  };

  const updatePoints = (currentRoom = level.lastVisitedRoom) => {
    if (!currentRoom) {
      return;
    }
    const nearbyEvilRooms = level
      .getConnectedRooms(currentRoom)
      .filter(Room.isEvil);

    const northPointValue = getCompassPointInView(
      player.angle,
      Direction4Angle.up
    );

    if (northPointValue >= 0 && northPointValue <= 1) {
      const north = pointsRefs.get("north");
      north.texture = sprites.frame.textures["compass_point_grey"];
      north.x = getPointX(northPointValue);

      const northText = textsRefs.get("north");
      northText.x = getPointX(northPointValue) + tileSize / 2;
      northText.text = "N";
    }

    const southPointValue = getCompassPointInView(
      player.angle,
      Direction4Angle.down
    );

    if (southPointValue >= 0 && southPointValue <= 1) {
      const south = pointsRefs.get("south");
      south.texture = sprites.frame.textures["compass_point_grey"];
      south.x = getPointX(southPointValue);

      const southText = textsRefs.get("south");
      southText.x = getPointX(southPointValue) + tileSize / 2;
      southText.text = "S";
    }

    const westPointValue = getCompassPointInView(
      player.angle,
      Direction4Angle.left
    );

    if (westPointValue >= 0 && westPointValue <= 1) {
      const west = pointsRefs.get("west");
      west.texture = sprites.frame.textures["compass_point_grey"];
      west.x = getPointX(westPointValue);

      const westText = textsRefs.get("west");
      westText.x = getPointX(westPointValue) + tileSize / 2;
      westText.text = "W";
    }

    const eastPointValue = getCompassPointInView(
      player.angle,
      Direction4Angle.right
    );

    if (eastPointValue >= 0 && eastPointValue <= 1) {
      const east = pointsRefs.get("east");
      east.texture = sprites.frame.textures["compass_point_grey"];
      east.x = getPointX(eastPointValue);

      const eastText = textsRefs.get("east");
      eastText.x = getPointX(eastPointValue) + tileSize / 2;
      eastText.text = "E";
    }

    pointsRefs.afterAll();
    textsRefs.afterAll();
  };

  player.subscribe("move", () => updatePoints());
  player.subscribe("turn", () => updatePoints());

  const unsubscribeFirstEnter = level.subscribe("room_enter", ({ room }) => {
    updatePoints(room);
    unsubscribeFirstEnter();
  });

  return () => {
    updateTrack();
    updatePoints();
  };
};

function getCompassPointInView(a: number, b: number) {
  return getPointInView(floorNumber(a, 10), floorNumber(b, 10), 200);
}
