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
  const pointsFrontLayer = new PIXI.Container();
  const pointsBackLayer = new PIXI.Container();
  parent.addChild(trackLayer);
  parent.addChild(pointsBackLayer);
  parent.addChild(pointsFrontLayer);

  const trackRefs = new Pool(
    () => trackLayer.addChild(new PIXI.Sprite()),
    (sprite) => sprite.destroy()
  );

  const pointsFrontRefs = new Pool(
    () => pointsFrontLayer.addChild(new PIXI.Sprite()),
    (sprite) => sprite.destroy()
  );

  const pointsBackRefs = new Pool(
    () => pointsBackLayer.addChild(new PIXI.Sprite()),
    (sprite) => sprite.destroy()
  );

  const textsRefs = new Pool(
    () => {
      const text = new PIXI.Text("", textStyles);
      text.anchor.set(0.5);
      return pointsBackLayer.addChild(text);
    },
    (sprite) => sprite.destroy()
  );

  const goldenRooms: Room[] = [];
  for (const room of level.rooms.values()) {
    if (Room.isGolden(room.value)) {
      goldenRooms.push(room.value);
    }
  }

  let nearbyEvilRooms: Room[] = [];
  level.subscribe("room_enter", ({ room }) => {
    nearbyEvilRooms = level.getConnectedRooms(room).filter(Room.isEvil);
  });

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
    left.texture = sprites.tiles.textures["compass_left"];
    left.x = frame.left + margin;
    left.y = frame.top;

    const right = trackRefs.get("right");
    right.texture = sprites.tiles.textures["compass_right"];
    right.x = frame.left + margin + width - tileSize;
    right.y = frame.top;

    for (let i = 1; i < tilesCount - 1; i++) {
      const mid = trackRefs.get(`mid_${i}`);
      mid.texture = sprites.tiles.textures["compass_mid"];
      mid.x = frame.left + margin + i * tileSize;
      mid.y = frame.top;
    }

    trackRefs.afterAll();
  };

  const updatePoints = () => {
    const northPointValue = getCompassPointInView(
      player.angle,
      Direction4Angle.up
    );

    if (isPointVisible(northPointValue)) {
      const north = pointsBackRefs.get("north");
      north.texture = sprites.tiles.textures["compass_point_grey"];
      north.x = getPointX(northPointValue);
      north.y = frame.top;

      const northText = textsRefs.get("north");
      northText.x = getPointX(northPointValue) + tileSize / 2;
      northText.y = frame.top;
      northText.text = "N";
    }

    const southPointValue = getCompassPointInView(
      player.angle,
      Direction4Angle.down
    );

    if (isPointVisible(southPointValue)) {
      const south = pointsBackRefs.get("south");
      south.texture = sprites.tiles.textures["compass_point_grey"];
      south.x = getPointX(southPointValue);
      south.y = frame.top;

      const southText = textsRefs.get("south");
      southText.x = getPointX(southPointValue) + tileSize / 2;
      southText.y = frame.top;
      southText.text = "S";
    }

    const westPointValue = getCompassPointInView(
      player.angle,
      Direction4Angle.left
    );

    if (isPointVisible(westPointValue)) {
      const west = pointsBackRefs.get("west");
      west.texture = sprites.tiles.textures["compass_point_grey"];
      west.x = getPointX(westPointValue);
      west.y = frame.top;

      const westText = textsRefs.get("west");
      westText.x = getPointX(westPointValue) + tileSize / 2;
      westText.y = frame.top;
      westText.text = "W";
    }

    const eastPointValue = getCompassPointInView(
      player.angle,
      Direction4Angle.right
    );

    if (isPointVisible(eastPointValue)) {
      const east = pointsBackRefs.get("east");
      east.texture = sprites.tiles.textures["compass_point_grey"];
      east.x = getPointX(eastPointValue);
      east.y = frame.top;

      const eastText = textsRefs.get("east");
      eastText.x = getPointX(eastPointValue) + tileSize / 2;
      eastText.y = frame.top;
      eastText.text = "E";
    }

    for (let i = 0; i < goldenRooms.length; i++) {
      const pointValue = clampPointValue(
        getCompassPointInView(
          player.angle,
          angleBetweenPoints(
            player.x,
            player.y,
            goldenRooms[i].x,
            goldenRooms[i].y
          )
        )
      );

      const point = pointsFrontRefs.get(`golden_${i}`);
      point.texture = sprites.tiles.textures["compass_point_gold"];
      point.x = getPointX(pointValue);
      point.y = frame.top;
    }

    for (let i = 0; i < nearbyEvilRooms.length; i++) {
      const pointValue = clampPointValue(
        getCompassPointInView(
          player.angle,
          angleBetweenPoints(
            player.x,
            player.y,
            nearbyEvilRooms[i].x,
            nearbyEvilRooms[i].y
          )
        )
      );

      const point = pointsFrontRefs.get(`evil_${i}`);
      point.texture = sprites.tiles.textures["compass_point_red"];
      point.x = getPointX(pointValue);
      point.y = frame.top;
    }

    pointsFrontRefs.afterAll();
    pointsBackRefs.afterAll();
    textsRefs.afterAll();
  };

  player.subscribe("move", updatePoints);
  player.subscribe("turn", updatePoints);

  return () => {
    updateTrack();
    updatePoints();
  };
};

function getCompassPointInView(a: number, b: number) {
  return getPointInView(floorNumber(a, 10), floorNumber(b, 10), 200);
}

function isPointVisible(value: number) {
  return !(value < 0 || value > 1);
}

function clampPointValue(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}
