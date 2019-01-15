import { NodeDescription } from '../syntaxtree.description';

export interface WorldDescription {
  size: {
    width: number,
    height: number
  }

  trucks: {
    position: {
      x: number,
      y: number
    },
    facing: string
  }[]

  tiles: {
    position: {
      x: number,
      y: number
    },
    openings?: string[],
    freight?: string[],
    freightTarget?: string,
    trafficLights?: {
      redPhase: number,
      greenPhase: number,
      startPhase: number
    }[]
  }[]
}

export function readFromNode(node: NodeDescription): WorldDescription {
  const wd = {
    size: {
      width: 0,
      height: 0
    },
    trucks: [],
    tiles: []
  };

  if (node.name === 'world' && node.children['size'].length === 1) {
    wd.size.width = +node.children['size'][0].properties['x'];
    wd.size.height = +node.children['size'][0].properties['y'];

    // Initialize empty tiles
    for (let y = 0; y < wd.size.width; y++) {
      for (let x = 0; x < wd.size.height; x++) {
        wd.tiles.push({
          position: { x: x, y: y },
          openings: [],
          freight: [],
          freightTarget: null,
          trafficLights: []
        });
      }
    }

    // Add trucks
    // TODO: Catch errors and missing definitions?
    node.children['trucks'].forEach((truck) => {
      wd.trucks.push({
        position: {
          x: +truck.children['position'][0].properties['x'],
          y: +truck.children['position'][0].properties['y']
        },
        facing: truck.children['orientation'][0].properties['direction']
      });
    });

    // Add defined tiles
    // TODO: Catch errors and missing definitions?
    node.children['roads'].forEach((tile) => {
      const posToIdx = (pos: NodeDescription): number => (+pos.properties['x']) + (+pos.properties['y']) * wd.size.width;
      wd.tiles[posToIdx(tile.children['position'][0])].openings = tile.children['openings'].map((o) => o.properties['direction']);
      // TODO: Process more tile properties
    });
  }

  return wd;
}