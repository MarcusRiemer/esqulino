import { NodeDescription } from "../syntaxtree.description";

export type WorldFreightColorDescription = "Red" | "Green" | "Blue";

export type WorldDirectionDescription = "N" | "E" | "S" | "W";

export interface WorldSizeDescription {
  width: number;
  height: number;
}

export interface WorldPositionDescription {
  x: number;
  y: number;
}

export interface WorldTrafficLightDescription {
  opening: WorldDirectionDescription;
  redPhase: number;
  greenPhase: number;
  startPhase: number;
}

export interface WorldTruckDescription {
  position: WorldPositionDescription;
  facing: WorldDirectionDescription;
  freight: WorldFreightColorDescription[];
}

export interface WorldTileDescription {
  position: WorldPositionDescription;
  openings?: WorldDirectionDescription[];
  freight?: WorldFreightColorDescription[];
  freightTarget?: WorldFreightColorDescription;
  trafficLights?: WorldTrafficLightDescription[];
}

export interface WorldDescription {
  size: WorldSizeDescription;
  trucks: WorldTruckDescription[];
  tiles: WorldTileDescription[];
}

export function readFromNode(node: NodeDescription): WorldDescription {
  const wd = {
    size: {
      width: 0,
      height: 0,
    },
    trucks: [],
    tiles: [],
  };

  if (node.name === "world" && node.children["size"].length === 1) {
    wd.size.width = +node.children["size"][0].properties["x"];
    wd.size.height = +node.children["size"][0].properties["y"];

    // Initialize empty tiles
    for (let y = 0; y < wd.size.width; y++) {
      for (let x = 0; x < wd.size.height; x++) {
        wd.tiles.push({
          position: { x: x, y: y },
          openings: [],
          freight: [],
          freightTarget: null,
          trafficLights: [],
        });
      }
    }

    // Add trucks
    // TODO: Catch errors and missing definitions?
    node.children["trucks"].forEach((truck) => {
      wd.trucks.push({
        position: {
          x: +truck.children["position"][0].properties["x"],
          y: +truck.children["position"][0].properties["y"],
        },
        facing: truck.children["orientation"][0].properties["direction"],
        freight: truck.children["freight"]
          ? truck.children["freight"].map((f) => f.properties["colour"])
          : [],
      });
    });

    // Add defined tiles
    // TODO: Catch errors and missing definitions?
    node.children["roads"].forEach((tile) => {
      const posToIdx = (pos: NodeDescription): number =>
        +pos.properties["x"] + +pos.properties["y"] * wd.size.width;
      wd.tiles[posToIdx(tile.children["position"][0])].openings = tile.children[
        "openings"
      ].map((o) => o.properties["direction"]);
      if (tile.children["freight"]) {
        wd.tiles[posToIdx(tile.children["position"][0])].freight =
          tile.children["freight"].map((o) => o.properties["colour"]);
      }
      if (
        tile.children["unloading_bay"] &&
        tile.children["unloading_bay"].length > 0
      ) {
        wd.tiles[posToIdx(tile.children["position"][0])].freightTarget =
          tile.children["unloading_bay"][0].properties["colour"];
      }
      if (
        tile.children["trafficLights"] &&
        tile.children["trafficLights"].length > 0
      ) {
        wd.tiles[posToIdx(tile.children["position"][0])].trafficLights =
          tile.children["trafficLights"].map((t) => {
            return {
              opening: t.children["side"][0].properties["direction"],
              redPhase: +t.properties["redPhase"],
              greenPhase: +t.properties["greenPhase"],
              startPhase: +t.properties["initialPhase"],
            };
          });
      }
    });
  }

  return wd;
}

function worldSizeDescToNode(size: WorldSizeDescription): NodeDescription {
  return {
    name: "vec2",
    language: "truck_world",
    properties: { x: String(size.width), y: String(size.height) },
  };
}

function worldPosDescToNode(pos: WorldPositionDescription): NodeDescription {
  return {
    name: "vec2",
    language: "truck_world",
    properties: { x: String(pos.x), y: String(pos.y) },
  };
}

function worldDirectionDescToNode(
  direction: WorldDirectionDescription
): NodeDescription {
  return {
    name: "direction",
    language: "truck_world",
    properties: {
      direction: direction,
    },
  };
}

function worldTruckDescToNode(truck: WorldTruckDescription): NodeDescription {
  return {
    name: "truck",
    language: "truck_world",
    children: {
      freight: truck.freight.map(worldFrightDescToNode),
      position: [worldPosDescToNode(truck.position)],
      orientation: [worldDirectionDescToNode(truck.facing)],
    },
  };
}

function worldUnloadingBayDescToNode(
  freightColor: WorldFreightColorDescription
): NodeDescription {
  return {
    name: "unloading_bay",
    language: "truck_world",
    properties: {
      colour: freightColor,
    },
  };
}

function worldTrafficLightToNode(
  light: WorldTrafficLightDescription
): NodeDescription {
  return {
    name: "trafficLight",
    language: "truck_world",
    properties: {
      redPhase: String(light.redPhase),
      greenPhase: String(light.greenPhase),
      initialPhase: String(light.startPhase),
    },
    children: {
      side: [worldDirectionDescToNode(light.opening)],
    },
  };
}

function worldFrightDescToNode(
  color: WorldFreightColorDescription
): NodeDescription {
  return {
    name: "freight",
    language: "truck_world",
    properties: {
      colour: color,
    },
  };
}

function worldTileDescToNode(tile: WorldTileDescription): NodeDescription {
  return {
    name: "road",
    language: "truck_world",
    children: {
      freight: tile.freight.map(worldFrightDescToNode),
      openings: tile.openings.map(worldDirectionDescToNode),
      position: [worldPosDescToNode(tile.position)],
      trafficLights: tile.trafficLights.map(worldTrafficLightToNode),
      unloading_bay: tile.freightTarget
        ? [worldUnloadingBayDescToNode(tile.freightTarget)]
        : [],
    },
  };
}

export function worldDescriptionToNode(
  worldDesc: WorldDescription
): NodeDescription {
  return {
    name: "world",
    language: "truck_world",
    children: {
      size: [worldSizeDescToNode(worldDesc.size)],
      roads: worldDesc.tiles.map(worldTileDescToNode),
      trucks: worldDesc.trucks.map(worldTruckDescToNode),
    },
  };
}
