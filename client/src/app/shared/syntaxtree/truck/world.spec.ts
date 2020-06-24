import {
  Command,
  Direction,
  DirectionUtil,
  Freight,
  LoadingError,
  Position,
  StrayedOffTheRoadError,
  Tile,
  TileOpening,
  TrafficLight,
  Truck,
  TurnDirection,
  UnloadingError,
  World,
} from "./world";
import { WorldDescription } from "./world.description";

const worldDescription: WorldDescription = {
  size: { width: 5, height: 5 },
  trucks: [{ position: { x: 1, y: 0 }, facing: "E", freight: [] }],
  tiles: [
    { position: { x: 0, y: 0 }, openings: ["E", "S"] },
    { position: { x: 1, y: 0 }, openings: ["E", "S", "W"] },
    { position: { x: 2, y: 0 }, openings: ["E", "W"], freight: ["Blue"] },
    { position: { x: 3, y: 0 }, openings: ["S", "W"] },
    { position: { x: 4, y: 0 } },

    { position: { x: 0, y: 1 }, openings: ["N", "S"] },
    { position: { x: 1, y: 1 }, openings: ["N", "E"] },
    { position: { x: 2, y: 1 }, openings: ["S", "W"] },
    { position: { x: 3, y: 1 }, openings: ["N", "E"], freightTarget: "Blue" },
    { position: { x: 4, y: 1 }, openings: ["S", "W"] },

    { position: { x: 0, y: 2 }, openings: ["N", "E", "S"] },
    { position: { x: 1, y: 2 }, openings: ["E", "W"] },
    {
      position: { x: 2, y: 2 },
      openings: ["N", "E", "S", "W"],
      freightTarget: "Red",
      trafficLights: [
        { opening: "N", redPhase: 3, greenPhase: 1, startPhase: 0 },
        { opening: "E", redPhase: 3, greenPhase: 1, startPhase: 1 },
        { opening: "S", redPhase: 3, greenPhase: 1, startPhase: 2 },
        { opening: "W", redPhase: 3, greenPhase: 1, startPhase: 3 },
      ],
    },
    { position: { x: 3, y: 2 }, openings: ["E", "W"] },
    { position: { x: 4, y: 2 }, openings: ["N", "S", "W"] },

    { position: { x: 0, y: 3 }, openings: ["N", "S"] },
    { position: { x: 1, y: 3 } },
    { position: { x: 2, y: 3 }, openings: ["N", "S"], freight: ["Red"] },
    { position: { x: 3, y: 3 } },
    { position: { x: 4, y: 3 }, openings: ["N", "S"] },

    { position: { x: 0, y: 4 }, openings: ["N", "E"] },
    { position: { x: 1, y: 4 }, openings: ["E", "W"] },
    { position: { x: 2, y: 4 }, openings: ["N", "E", "W"] },
    { position: { x: 3, y: 4 }, openings: ["E", "W"] },
    { position: { x: 4, y: 4 }, openings: ["N", "W"] },
  ],
};

/******************************************************************************
 * World
 ******************************************************************************/
describe("Shared: World", () => {
  let world: World;

  beforeEach(() => {
    world = new World(worldDescription);
    world.smartForward = true;
  });

  it("should have exactly one state", () => {
    expect(world.states.length).toEqual(1);
  });

  it("shouldn't be solved yet", () => {
    expect(world.solved).toBeFalsy();
  });

  it("should have a truck at 1/0 facing east", () => {
    expect(world.state.truck.position.x).toEqual(1);
    expect(world.state.truck.position.y).toEqual(0);
    expect(world.state.truck.facingDirection).toEqual(Direction.East);
  });

  it("should let truck move forward", () => {
    world.command(Command.goForward);
    expect(world.state.truck.position.x).toEqual(2);
    expect(world.state.truck.position.y).toEqual(0);
  });

  it("should let truck turn right", () => {
    world.command(Command.turnRight);
    world.command(Command.goForward);
    expect(world.state.truck.position.x).toEqual(1);
    expect(world.state.truck.position.y).toEqual(1);
  });

  it("shouldn't let truck turn left", () => {
    world.command(Command.turnLeft);
    expect(() => world.command(Command.goForward)).toThrow(
      new StrayedOffTheRoadError()
    );
  });

  it("shouldn't let truck load", () => {
    expect(() => world.command(Command.load)).toThrow(new LoadingError());
  });

  it("should let truck load", () => {
    world.command(Command.goForward);
    world.command(Command.load);
    expect(world.state.truck.freightItems).toEqual(1);
  });

  it("shouldn't let truck unload", () => {
    expect(() => world.command(Command.unload)).toThrow(new UnloadingError());
  });

  it("should let truck unload", () => {
    world.command(Command.goForward);
    world.command(Command.load);
    world.command(Command.goForward);
    world.command(Command.goForward);
    world.command(Command.unload);
    expect(world.state.truck.freightItems).toEqual(0);
  });

  it("should return the right state", () => {
    expect(world.getState(0).step).toEqual(0);
    expect(world.getState(1)).toBeNull();

    world.command(Command.goForward);
    world.command(Command.load);
    world.command(Command.goForward);
    world.command(Command.goForward);
    world.command(Command.unload);

    expect(world.getState(0).step).toEqual(0);
    expect(world.getState(1).step).toEqual(1);
    expect(world.getState(2).step).toEqual(2);
    expect(world.getState(3).step).toEqual(3);
    expect(world.getState(4).step).toEqual(4);
  });
});

describe("World.getRoadOpeningsBetween", () => {
  let world: World;

  beforeEach(() => {
    world = new World(worldDescription);
  });

  it("opening to north", () => {
    const openings = World.getRoadOpeningsBetween(
      new Position(0, 0),
      new Position(0, 1)
    );
    expect(openings).toEqual({
      from: TileOpening.South,
      to: TileOpening.North,
    });
  });

  it("opening to east", () => {
    const openings = World.getRoadOpeningsBetween(
      new Position(1, 0),
      new Position(0, 0)
    );
    expect(openings).toEqual({
      from: TileOpening.West,
      to: TileOpening.East,
    });
  });

  it("opening to south", () => {
    const openings = World.getRoadOpeningsBetween(
      new Position(0, 1),
      new Position(0, 0)
    );
    expect(openings).toEqual({
      from: TileOpening.North,
      to: TileOpening.South,
    });
  });

  it("opening to west", () => {
    const openings = World.getRoadOpeningsBetween(
      new Position(0, 0),
      new Position(1, 0)
    );
    expect(openings).toEqual({
      from: TileOpening.East,
      to: TileOpening.West,
    });
  });

  it("invalid position", () => {
    const openings = World.getRoadOpeningsBetween(
      new Position(0, 0),
      new Position(1, 1)
    );
    expect(openings).toBeUndefined();
  });
});

/******************************************************************************
 * WorldState
 ******************************************************************************/
describe("WorldState.getDirectNeighbors", () => {
  let world: World;

  beforeEach(() => {
    world = new World(worldDescription);
  });

  function containsPosition(array, expectedX, expectedY) {
    return array.some(
        (pos) =>
            pos.x === expectedX &&
            pos.y === expectedY
    );
  }

  it("middle of the world", () => {
    const position = new Position(2, 2);
    const neighbors = world.state.getDirectNeighbors(position);
    expect(neighbors.length).toEqual(4);

    expect(containsPosition(neighbors, 2, 1)).toEqual(true);
    expect(containsPosition(neighbors, 3, 2)).toEqual(true);
    expect(containsPosition(neighbors, 2, 3)).toEqual(true);
    expect(containsPosition(neighbors, 1, 2)).toEqual(true);
  });

  it("top left corner", () => {
    const position = new Position(0, 0);
    const neighbors = world.state.getDirectNeighbors(position);
    expect(neighbors.length).toEqual(2);

    expect(containsPosition(neighbors, 0, 1)).toEqual(true);
    expect(containsPosition(neighbors, 1, 0)).toEqual(true);
  });

  it("top right corner", () => {
    const position = new Position(4, 0);
    const neighbors = world.state.getDirectNeighbors(position);
    expect(neighbors.length).toEqual(2);

    expect(containsPosition(neighbors, 3, 0)).toEqual(true);
    expect(containsPosition(neighbors, 4, 1)).toEqual(true);
  });

  it("bottom left corner", () => {
    const position = new Position(0, 4);
    const neighbors = world.state.getDirectNeighbors(position);
    expect(neighbors.length).toEqual(2);

    expect(containsPosition(neighbors, 0, 3)).toEqual(true);
    expect(containsPosition(neighbors, 1, 4)).toEqual(true);
  });

  it("bottom right corner", () => {
    const position = new Position(4, 4);
    const neighbors = world.state.getDirectNeighbors(position);
    expect(neighbors.length).toEqual(2);

    expect(containsPosition(neighbors, 4, 3)).toEqual(true);
    expect(containsPosition(neighbors, 3, 4)).toEqual(true);
  });
});


/******************************************************************************
 * Truck
 ******************************************************************************/
describe("Shared: Truck", () => {
  const position = new Position(1, 1);
  let truck: Truck;

  beforeEach(() => {
    truck = new Truck(position, DirectionUtil.toNumber(Direction.West));
  });

  it("should load freight", () => {
    truck.loadFreight(Freight.Red);
    expect(truck.freightItems).toEqual(1);
  });

  it("should unload freight", () => {
    truck.loadFreight(Freight.Red);
    truck.unloadFreight();
    expect(truck.freightItems).toEqual(0);
  });

  it("should know the freight color", () => {
    truck.loadFreight(Freight.Red);
    expect(truck.freightColor()).toEqual("red");
  });

  it("should know the facing direction while turning right", () => {
    expect(truck.facingDirection).toEqual(Direction.West);
    truck.facing += TurnDirection.Right;
    expect(truck.facingDirection).toEqual(Direction.North);
    truck.facing += TurnDirection.Right;
    expect(truck.facingDirection).toEqual(Direction.East);
    truck.facing += TurnDirection.Right;
    expect(truck.facingDirection).toEqual(Direction.South);
    truck.facing += TurnDirection.Right;
    expect(truck.facingDirection).toEqual(Direction.West);
    truck.facing += TurnDirection.Right;
    expect(truck.facingDirection).toEqual(Direction.North);
  });

  it("should know the facing direction while turning left", () => {
    expect(truck.facingDirection).toEqual(Direction.West);
    truck.facing += TurnDirection.Left;
    expect(truck.facingDirection).toEqual(Direction.South);
    truck.facing += TurnDirection.Left;
    expect(truck.facingDirection).toEqual(Direction.East);
    truck.facing += TurnDirection.Left;
    expect(truck.facingDirection).toEqual(Direction.North);
    truck.facing += TurnDirection.Left;
    expect(truck.facingDirection).toEqual(Direction.West);
    truck.facing += TurnDirection.Left;
    expect(truck.facingDirection).toEqual(Direction.South);
  });

  it("should know the facing direction after move", () => {
    expect(truck.facingDirectionAfterMove).toEqual(Direction.West);
    truck.turn(TurnDirection.Left);
    expect(truck.facingDirectionAfterMove).toEqual(
      DirectionUtil.turn(Direction.West, TurnDirection.Left)
    );
    truck.turn(TurnDirection.Right);
    expect(truck.facingDirectionAfterMove).toEqual(
      DirectionUtil.turn(Direction.West, TurnDirection.Right)
    );
    truck.turn(TurnDirection.Straight);
    expect(truck.facingDirectionAfterMove).toEqual(Direction.West);
  });
});

/******************************************************************************
 * Tile
 ******************************************************************************/
describe("Shared: Tile", () => {
  const position = new Position(1, 1);
  let tile: Tile, tileNE: Tile, tileRF: Tile, tileGF: Tile, tileBF: Tile;

  beforeEach(() => {
    // Leere Kacheln
    tile = new Tile(position, TileOpening.None, [], null, []);
    tileNE = new Tile(position, TileOpening.N | TileOpening.E, [], null, []);

    // Kacheln mit Fracht
    tileRF = new Tile(position, TileOpening.None, [Freight.Red], null, []);
    tileGF = new Tile(position, TileOpening.None, [Freight.Green], null, []);
    tileBF = new Tile(position, TileOpening.None, [Freight.Blue], null, []);
  });

  it("shouldn't have any openings", () => {
    expect(tile.hasOpening(TileOpening.None)).toBeTruthy();

    expect(tile.hasOpeningInDirection(Direction.North)).toBeFalsy();
    expect(tile.hasOpeningInDirection(Direction.East)).toBeFalsy();
    expect(tile.hasOpeningInDirection(Direction.South)).toBeFalsy();
    expect(tile.hasOpeningInDirection(Direction.West)).toBeFalsy();
  });

  it("should be a curve", () => {
    expect(tileNE.isCurve()).toBeTruthy();

    expect(tileNE.hasOpening(TileOpening.N)).toBeTruthy();
    expect(tileNE.hasOpening(TileOpening.E)).toBeTruthy();
    expect(tileNE.hasOpening(TileOpening.N | TileOpening.E)).toBeTruthy();

    expect(tileNE.hasOpeningInDirection(Direction.North)).toBeTruthy();
    expect(tileNE.hasOpeningInDirection(Direction.East)).toBeTruthy();
    expect(tileNE.hasOpeningInDirection(Direction.South)).toBeFalsy();
    expect(tileNE.hasOpeningInDirection(Direction.West)).toBeFalsy();
  });

  it("should have right curve turn direction", () => {
    expect(tileNE.curveTurnDirection(Direction.South)).toEqual(
      TurnDirection.Left
    );
    expect(tileNE.curveTurnDirection(Direction.West)).toEqual(
      TurnDirection.Right
    );
  });

  it("shouldn't have freight", () => {
    expect(tile.freightItems).toEqual(0);
  });

  it("should have freight", () => {
    expect(tileRF.freightItems).toEqual(1);
    expect(tileGF.freightItems).toEqual(1);
    expect(tileBF.freightItems).toEqual(1);
  });

  it("should have freight after adding it", () => {
    tile.addFreight(Freight.Red);
    expect(tile.freightItems).toEqual(1);
  });

  it("shouldn't have freight after removing it", () => {
    tile.addFreight(Freight.Red);
    tile.removeFreight();
    expect(tile.freightItems).toEqual(0);
  });

  it("should know the freight colors", () => {
    expect(tileRF.freightColor()).toEqual("red");
    expect(tileGF.freightColor()).toEqual("green");
    expect(tileBF.freightColor()).toEqual("blue");
  });

  it("should return the right traffic lights", () => {
    const tl = [
      new TrafficLight(3, 1, 0),
      new TrafficLight(3, 1, 1),
      new TrafficLight(3, 1, 2),
      new TrafficLight(3, 1, 3),
    ];
    const tileTL = new Tile(
      position,
      TileOpening.N | TileOpening.E | TileOpening.S | TileOpening.W,
      [],
      null,
      tl
    );

    expect(tile.trafficLight(Direction.North)).toBeNull();

    expect(tileTL.trafficLight(Direction.North)).toEqual(tl[0]);
    expect(tileTL.trafficLight(Direction.East)).toEqual(tl[1]);
    expect(tileTL.trafficLight(Direction.South)).toEqual(tl[2]);
    expect(tileTL.trafficLight(Direction.West)).toEqual(tl[3]);
  });
});

/******************************************************************************
 * TrafficLight
 ******************************************************************************/
describe("Shared: TrafficLight", () => {
  let firstRed: TrafficLight,
    firstGreen: TrafficLight,
    alwaysRed: TrafficLight,
    alwaysGreen: TrafficLight;

  beforeEach(() => {
    firstRed = new TrafficLight(1, 1, 0);
    firstGreen = new TrafficLight(1, 1, 1);
    alwaysRed = new TrafficLight(1, 0, 0);
    alwaysGreen = new TrafficLight(0, 1, 0);
  });

  it("should be red", () => {
    expect(firstRed.isRed(0)).toBeTruthy();
    expect(firstRed.isRed(2)).toBeTruthy();

    expect(firstGreen.isRed(1)).toBeTruthy();
    expect(firstGreen.isRed(3)).toBeTruthy();

    expect(alwaysRed.isRed(0)).toBeTruthy();
    expect(alwaysRed.isRed(1)).toBeTruthy();
    expect(alwaysRed.isRed(2)).toBeTruthy();
  });

  it("should be green", () => {
    expect(firstGreen.isGreen(0)).toBeTruthy();
    expect(firstGreen.isGreen(2)).toBeTruthy();

    expect(firstRed.isGreen(1)).toBeTruthy();
    expect(firstRed.isGreen(3)).toBeTruthy();

    expect(alwaysGreen.isGreen(0)).toBeTruthy();
    expect(alwaysGreen.isGreen(1)).toBeTruthy();
    expect(alwaysGreen.isGreen(2)).toBeTruthy();
  });
});

/******************************************************************************
 * Position
 ******************************************************************************/
describe("Shared: Position", () => {
  let world: World;

  beforeEach(() => {
    world = new World(worldDescription);
  });

  it("should save coordinates", () => {
    const position = new Position(1, 20);
    expect(position.x).toEqual(1);
    expect(position.y).toEqual(20);
  });
});

/******************************************************************************
 * DirectionUtil
 ******************************************************************************/
describe("Shared: DirectionUtil", () => {
  it("should detect opposites", () => {
    expect(DirectionUtil.opposite(Direction.North)).toEqual(Direction.South);
    expect(DirectionUtil.opposite(Direction.East)).toEqual(Direction.West);
    expect(DirectionUtil.opposite(Direction.South)).toEqual(Direction.North);
    expect(DirectionUtil.opposite(Direction.West)).toEqual(Direction.East);
  });

  it("should convert to TileOpening", () => {
    expect(DirectionUtil.toTileOpening(Direction.North)).toEqual(
      TileOpening.North
    );
    expect(DirectionUtil.toTileOpening(Direction.East)).toEqual(
      TileOpening.East
    );
    expect(DirectionUtil.toTileOpening(Direction.South)).toEqual(
      TileOpening.South
    );
    expect(DirectionUtil.toTileOpening(Direction.West)).toEqual(
      TileOpening.West
    );
  });

  it("should convert to numbers", () => {
    expect(DirectionUtil.toNumber(Direction.North)).toEqual(0);
    expect(DirectionUtil.toNumber(Direction.East)).toEqual(1);
    expect(DirectionUtil.toNumber(Direction.South)).toEqual(2);
    expect(DirectionUtil.toNumber(Direction.West)).toEqual(3);
  });

  it("should convert from number", () => {
    expect(DirectionUtil.fromNumber(0)).toEqual(Direction.North);
    expect(DirectionUtil.fromNumber(1)).toEqual(Direction.East);
    expect(DirectionUtil.fromNumber(2)).toEqual(Direction.South);
    expect(DirectionUtil.fromNumber(3)).toEqual(Direction.West);
  });

  it("should convert to chars", () => {
    expect(DirectionUtil.toChar(Direction.North)).toEqual("N");
    expect(DirectionUtil.toChar(Direction.East)).toEqual("E");
    expect(DirectionUtil.toChar(Direction.South)).toEqual("S");
    expect(DirectionUtil.toChar(Direction.West)).toEqual("W");
  });

  it("should convert from chars", () => {
    expect(DirectionUtil.fromChar("N")).toEqual(Direction.North);
    expect(DirectionUtil.fromChar("E")).toEqual(Direction.East);
    expect(DirectionUtil.fromChar("S")).toEqual(Direction.South);
    expect(DirectionUtil.fromChar("W")).toEqual(Direction.West);
  });

  it("should openings to its direction", () => {
    expect(DirectionUtil.openingToDirectionArray(TileOpening.None)).toEqual([]);

    expect(DirectionUtil.openingToDirectionArray(TileOpening.North)).toEqual([
      Direction.North,
    ]);
    expect(DirectionUtil.openingToDirectionArray(TileOpening.East)).toEqual([
      Direction.East,
    ]);
    expect(DirectionUtil.openingToDirectionArray(TileOpening.South)).toEqual([
      Direction.South,
    ]);
    expect(DirectionUtil.openingToDirectionArray(TileOpening.West)).toEqual([
      Direction.West,
    ]);

    expect(
      DirectionUtil.openingToDirectionArray(
        TileOpening.North | TileOpening.East
      )
    ).toEqual([Direction.North, Direction.East]);
    expect(
      DirectionUtil.openingToDirectionArray(
        TileOpening.North | TileOpening.South
      )
    ).toEqual([Direction.North, Direction.South]);
    expect(
      DirectionUtil.openingToDirectionArray(
        TileOpening.North | TileOpening.West
      )
    ).toEqual([Direction.North, Direction.West]);
    expect(
      DirectionUtil.openingToDirectionArray(
        TileOpening.East | TileOpening.South
      )
    ).toEqual([Direction.East, Direction.South]);
    expect(
      DirectionUtil.openingToDirectionArray(TileOpening.East | TileOpening.West)
    ).toEqual([Direction.East, Direction.West]);
    expect(
      DirectionUtil.openingToDirectionArray(
        TileOpening.South | TileOpening.West
      )
    ).toEqual([Direction.South, Direction.West]);

    expect(
      DirectionUtil.openingToDirectionArray(
        TileOpening.East | TileOpening.South | TileOpening.West
      )
    ).toEqual([Direction.East, Direction.South, Direction.West]);
    expect(
      DirectionUtil.openingToDirectionArray(
        TileOpening.North | TileOpening.South | TileOpening.West
      )
    ).toEqual([Direction.North, Direction.South, Direction.West]);
    expect(
      DirectionUtil.openingToDirectionArray(
        TileOpening.North | TileOpening.East | TileOpening.West
      )
    ).toEqual([Direction.North, Direction.East, Direction.West]);
    expect(
      DirectionUtil.openingToDirectionArray(
        TileOpening.North | TileOpening.East | TileOpening.South
      )
    ).toEqual([Direction.North, Direction.East, Direction.South]);

    expect(
      DirectionUtil.openingToDirectionArray(
        TileOpening.North |
          TileOpening.East |
          TileOpening.South |
          TileOpening.West
      )
    ).toEqual([
      Direction.North,
      Direction.East,
      Direction.South,
      Direction.West,
    ]);
  });

  it("shouldn't take turns", () => {
    expect(DirectionUtil.turn(Direction.North, TurnDirection.Straight)).toEqual(
      Direction.North
    );
    expect(DirectionUtil.turn(Direction.East, TurnDirection.Straight)).toEqual(
      Direction.East
    );
    expect(DirectionUtil.turn(Direction.South, TurnDirection.Straight)).toEqual(
      Direction.South
    );
    expect(DirectionUtil.turn(Direction.West, TurnDirection.Straight)).toEqual(
      Direction.West
    );
  });

  it("should take left turns", () => {
    expect(DirectionUtil.turn(Direction.North, TurnDirection.Left)).toEqual(
      Direction.West
    );
    expect(DirectionUtil.turn(Direction.East, TurnDirection.Left)).toEqual(
      Direction.North
    );
    expect(DirectionUtil.turn(Direction.South, TurnDirection.Left)).toEqual(
      Direction.East
    );
    expect(DirectionUtil.turn(Direction.West, TurnDirection.Left)).toEqual(
      Direction.South
    );
  });

  it("should take right turns", () => {
    expect(DirectionUtil.turn(Direction.North, TurnDirection.Right)).toEqual(
      Direction.East
    );
    expect(DirectionUtil.turn(Direction.East, TurnDirection.Right)).toEqual(
      Direction.South
    );
    expect(DirectionUtil.turn(Direction.South, TurnDirection.Right)).toEqual(
      Direction.West
    );
    expect(DirectionUtil.turn(Direction.West, TurnDirection.Right)).toEqual(
      Direction.North
    );
  });
});
