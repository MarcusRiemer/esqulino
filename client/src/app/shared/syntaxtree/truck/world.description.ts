import { NodeDescription } from "../syntaxtree.description";

export interface WorldDescription {
  size: {
    width: number;
    height: number;
  };

  trucks: {
    position: {
      x: number;
      y: number;
    };
    facing: string;
    freight: string[];
  }[];

  tiles: {
    position: {
      x: number;
      y: number;
    };
    openings?: string[];
    freight?: string[];
    freightTarget?: string;
    trafficLights?: {
      opening: string;
      redPhase: number;
      greenPhase: number;
      startPhase: number;
    }[];
  }[];
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
        wd.tiles[
          posToIdx(tile.children["position"][0])
        ].freight = tile.children["freight"].map((o) => o.properties["colour"]);
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
        wd.tiles[
          posToIdx(tile.children["position"][0])
        ].trafficLights = tile.children["trafficLights"].map((t) => {
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
