import {
  WorldDescription,
  WorldDirectionDescription,
  WorldFreightColorDescription,
  WorldTileDescription,
  WorldTrafficLightDescription,
  WorldTruckDescription,
} from "./world.description";
import { BehaviorSubject } from "rxjs";
import { NodeLocation } from "../syntaxtree.description";

import { enablePatches, immerable, Patch, produceWithPatches } from "immer";
enablePatches();

// https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/GeneratorFunction
const GeneratorFunction = Object.getPrototypeOf(function* () {}).constructor;

/**
 * A callback that is meant to be triggered when the execution of the program
 * has made some sort of significant progress.
 *
 * @param loc The current "position" of the execution in the AST
 */
type ExecutionProgessCallback = (loc: NodeLocation) => void;

/**
 * Representation of the game world.
 */
export class World {
  /** States of the world, where the first state is always the most recent. */
  states: Array<WorldState>;

  /** Will be undefined if not in editor mode or no changes */
  previewChanges?: Patch[];

  /** Duration of a step in milliseconds. */
  animationSpeed = 1000;

  /**
   * Activate smart goForward command, which can automatically take turns
   * without a set turn signal.
   */
  smartForward = false;

  /** Command is in progress. */
  commandInProgress = new BehaviorSubject(false);

  /** Code is or should be paused. */
  codeShouldPause = new BehaviorSubject(false);

  /** Generator for the currently loaded code. */
  private _currentGenerator: Generator;

  /** Executable commands. */
  readonly commands = {
    // Go forward, if possible
    [Command.goForward]: (state: WorldState) => {
      const curTile = state.getTile(state.truck.position);
      // Check for roads
      if (curTile.hasOpeningInDirection(state.truck.facingDirectionAfterMove)) {
        // Check if traffic light is green
        const trafficLight = curTile.trafficLight(
          DirectionUtil.opposite(state.truck.facingDirection)
        );
        if (trafficLight == null || trafficLight.isGreen(this.timeStep)) {
          state.truck.move();
          state.time = 1;
          return state;
        }
        throw new RedLightViolationError();
        // Curves can also be taken without set turn signal
      } else if (
        this.smartForward &&
        curTile.isCurve() &&
        state.truck.turning === TurnDirection.Straight
      ) {
        state.truck.move(
          curTile.curveTurnDirection(state.truck.facingDirection)
        );
        state.time = 1;
        return state;
      }
      throw new StrayedOffTheRoadError();
    },

    // Set turn signal left
    [Command.turnLeft]: (state: WorldState): WorldState => {
      state.truck.turn(TurnDirection.Left);
      state.time = 0;
      return state;
    },

    // Set turn signal right
    [Command.turnRight]: (state: WorldState): WorldState => {
      state.truck.turn(TurnDirection.Right);
      state.time = 0;
      return state;
    },

    // Turn off turn signal
    [Command.noTurn]: (state: WorldState): WorldState => {
      state.truck.turn(TurnDirection.Straight);
      state.time = 0;
      return state;
    },

    // Load freight if possible
    [Command.load]: (state: WorldState): WorldState => {
      const tile = state.getTile(state.truck.position);
      if (state.truck.freightItems === 0 && tile.freightItems > 0) {
        state.truck.loadFreight(tile.removeFreight());
        state.time = 1;
        return state;
      }
      throw new LoadingError();
    },

    // Unload freight if possible
    [Command.unload]: (state: WorldState): WorldState => {
      const tile = state.getTile(state.truck.position);
      // Is freight loaded?
      if (state.truck.freightItems > 0) {
        // Can be unloaded on target?
        if (state.truck.freightItem() === tile.freightTarget) {
          state.truck.unloadFreight();
          state.time = 1;
          return state;
          // Can be unloaded on empty field?
        } else if (tile.tryAddFreight(state.truck.unloadFreight())) {
          state.time = 1;
          return state;
        }
      }
      throw new UnloadingError();
    },

    // Wait a step without activity
    [Command.wait]: (state: WorldState): WorldState => {
      state.time = 1;
      return state;
    },

    // Pause execution until further notice
    [Command.pause]: (_state: WorldState): WorldState => {
      this.codeShouldPause.next(true);
      return null;
    },

    // Do nothing, but still check if program should terminate
    [Command.doNothing]: (_state: WorldState): WorldState => {
      return null;
    },
  };

  /** Sensors. */
  readonly sensors = {
    // Is the traffic light in front of the truck red?
    [Sensor.lightIsRed]: (state: WorldState): boolean => {
      const trafficLight = state
        .getTile(state.truck.position)
        .trafficLight(DirectionUtil.opposite(state.truck.facingDirection));
      return trafficLight != null && trafficLight.isRed(this.timeStep);
    },

    // Is the traffic light in front of the truck green?
    [Sensor.lightIsGreen]: (state: WorldState): boolean => {
      const trafficLight = state
        .getTile(state.truck.position)
        .trafficLight(DirectionUtil.opposite(state.truck.facingDirection));
      return trafficLight != null && trafficLight.isGreen(this.timeStep);
    },

    // Can the truck go straight?
    [Sensor.canGoStraight]: (state: WorldState): boolean => {
      return state
        .getTile(state.truck.position)
        .hasOpeningInDirection(state.truck.facingDirection);
    },

    // Can the truck turn left?
    [Sensor.canTurnLeft]: (state: WorldState): boolean => {
      return state
        .getTile(state.truck.position)
        .hasOpeningInDirection(
          DirectionUtil.turn(state.truck.facingDirection, TurnDirection.Left)
        );
    },

    // Can the truck turn right?
    [Sensor.canTurnRight]: (state: WorldState): boolean => {
      return state
        .getTile(state.truck.position)
        .hasOpeningInDirection(
          DirectionUtil.turn(state.truck.facingDirection, TurnDirection.Right)
        );
    },

    // Can the truck load here?
    [Sensor.canLoad]: (state: WorldState): boolean => {
      return (
        state.truck.freightItems === 0 && // Doesn't have anything loaded
        state.getTile(state.truck.position).freightItems > 0
      ); // Item on tile
    },

    // Can the truck unload here?
    [Sensor.canUnload]: (state: WorldState): boolean => {
      const tile = state.getTile(state.truck.position);
      return (
        state.truck.freightItems > 0 && // Is freight loaded?
        (state.truck.freightItem() === tile.freightTarget || // Can be unloaded on target?
          (tile.freightItems === 0 && tile.freightTarget == null)) // Can be unloaded on empty field?
      );
    },

    // Is the Truck on a target?
    [Sensor.isOnTarget]: (state: WorldState): boolean => {
      return state.getTile(state.truck.position).freightTarget !== null;
    },

    // Is the world solved?
    [Sensor.isSolved]: (state: WorldState): boolean => {
      return state.solved;
    },
  };

  /**
   * Initializes the world following the world description with an initial
   * state.
   * @param desc Description of the world.
   */
  constructor(desc: WorldDescription) {
    const truck = new Truck(
      new Position(desc.trucks[0].position.x, desc.trucks[0].position.y),
      DirectionUtil.toNumber(DirectionUtil.fromChar(desc.trucks[0].facing)),
      desc.trucks[0].freight.map(
        (f) =>
          ({
            Red: Freight.Red,
            Green: Freight.Green,
            Blue: Freight.Blue,
          }[f])
      )
    );

    const tiles = desc.tiles.map((tile) => {
      // Defaults
      let openings = TileOpening.None;
      let freight: Freight[] = [];
      let freightTarget: Freight = null;
      let trafficLights: TrafficLight[] = [null, null, null, null];

      // Openings
      if (tile.openings) {
        openings = tile.openings.reduce(
          (a, v) => a | DirectionUtil.toTileOpening(DirectionUtil.fromChar(v)),
          TileOpening.None
        );
      }

      // Freight
      if (tile.freight) {
        freight = tile.freight.map(
          (f) =>
            ({
              Red: Freight.Red,
              Green: Freight.Green,
              Blue: Freight.Blue,
            }[f])
        );
      }

      // Freight target
      if (tile.freightTarget) {
        freightTarget = {
          Red: Freight.Red,
          Green: Freight.Green,
          Blue: Freight.Blue,
        }[tile.freightTarget];
      }

      // Traffic lights
      if (tile.trafficLights) {
        tile.trafficLights.forEach((t) => {
          trafficLights[
            {
              N: 0,
              E: 1,
              S: 2,
              W: 3,
            }[t.opening]
          ] = new TrafficLight(t.redPhase, t.greenPhase, t.startPhase);
        });
      }

      return new Tile(
        new Position(tile.position.x, tile.position.y),
        openings,
        freight,
        freightTarget,
        trafficLights
      );
    });

    const size = new Size(desc.size.width, desc.size.height);
    this.states = [new WorldState(size, tiles, truck, 0)];
  }

  /**
   * Returns the current state.
   * @return Current state.
   */
  get state(): WorldState {
    return this.states[0];
  }

  /**
   * Returns the state of a particular step.
   * @param step Number of the state.
   * @return State.
   */
  getState(step: number): WorldState {
    return step >= 0 && step < this.states.length
      ? this.states[this.states.length - 1 - step]
      : null;
  }

  /**
   * Returns the number of the current step (starting at 0).
   * @return Number of the current step (starting at 0).
   */
  get step(): number {
    return this.states.length - 1;
  }

  /**
   * Returns the past time steps.
   * @return Past time steps.
   */
  get timeStep(): number {
    return this.states.reduce((a: number, v: WorldState) => a + v.time, 0);
  }

  /**
   * Passes a copy of the current state to the passed function and inserts the
   * changed state as the current state if the return value of the passed
   * function is not null.
   * @param f Function that receives a copy of the current state, makes changes
   *          if necessary and returns it.
   */
  mutateState(f: (state: WorldState) => WorldState | null): WorldState | null {
    const s = this.state;
    const [newState, patches] = produceWithPatches(s, f);

    if (patches.length == 0) {
      // If you see this warning, it could be an indication
      // that you made a new custom class and forgot to add
      // [immerable] = true;
      // or the functions simply did not change anything
      console.warn("mutateState was called, but state did not change!", f);
    }

    if (newState) {
      this.states.unshift(newState);
    }
    return newState;
  }

  /**
   * Runs a function that can modify the worldstate.
   * All changes will be saved inside _this_.previewChanges
   * @param f The function that will change the state
   */
  public mutateStateAsPreview(
    f: (state: WorldState) => WorldState | null
  ): void {
    const [newState, patches] = produceWithPatches(this.state, f);

    this.previewChanges = patches;
  }

  /**
   * Deletes all _this_.previewChanges
   */
  public deletePreview(): void {
    this.previewChanges = undefined;
  }

  /**
   * Passes a copy of the current state to the passed function and inserts the
   * changed state as the current state if the return value of the passed
   * function is not null. The returned promise will be resolved when the time
   * scheduled for the action in this change of state is over.
   * @param f Function that receives a copy of the current state, makes changes
   *          if necessary and returns it.
   * @return Promise, which is resolved when the scheduled time is over.
   */
  mutateStateAsync(f: (state: WorldState) => WorldState): Promise<void> {
    const state = this.mutateState(f);
    return new Promise((resolve, _reject) => {
      setTimeout(
        () => resolve(),
        Math.max(
          state != null ? state.time * this.animationSpeed : 0,
          1 // always pause for at least a very short time to avoid busy waiting
        )
      );
    });
  }

  /**
   * Undoes the last change of state.
   */
  undo() {
    if (this.states.length > 1) {
      this.states.shift();
    }
  }

  /**
   * Resets the world state.
   */
  reset() {
    while (this.states.length > 1) {
      this.undo();
    }
  }

  /**
   * Indicates whether all freight has been delivered to their destination.
   * @return True, when all freight has been delivered to their destination,
   *         otherwise false.
   */
  get solved(): boolean {
    return this.state.solved;
  }

  /**
   * Executes a command on the world.
   * @param command Command to be executed.
   */
  command(command: Command) {
    this.mutateState(this.commands[command]);
  }

  /**
   * Executes a command on the world. The returned promise will be resolved when
   * the time scheduled for the action in this change of state is over. Also
   * sets `commandInProgress`.
   * @param command Command to be executed.
   * @return Promise, which is resolved when the scheduled time is over.
   */
  async commandAsync(command: Command): Promise<void> {
    this.commandInProgress.next(true);
    try {
      await this._commandAsync(command);
    } catch (error) {
      throw error;
    } finally {
      this.commandInProgress.next(false);
    }
  }

  /**
   * Executes a command on the world. The returned promise will be resolved when
   * the time scheduled for the action in this change of state is over. This
   * function doesn't set `commandInProgress`, so it should only be called by a
   * function that does that.
   * @param command Command to be executed.
   * @return Promise, which is resolved when the scheduled time is over.
   */
  private async _commandAsync(command: Command): Promise<void> {
    await this.mutateStateAsync(this.commands[command]);
  }

  /**
   * Queries a sensor and returns the result.
   * @param sensor Sensor to be queried.
   * @return Result of the sensor.
   */
  sensor(sensor: Sensor): boolean {
    return this.sensors[sensor](this.state);
  }

  /**
   * Executes a string of JavaScript-Code inside a function with the proper
   * this-context.
   * @param code Code to be executed.
   */
  async runCode(
    code: string,
    progressCallback: ExecutionProgessCallback = (_) => {}
  ) {
    var self = this;
    this.commandInProgress.next(true);
    this.codeShouldPause.next(false);
    progressCallback(undefined);

    try {
      const f = new GeneratorFunction("truck", code);

      this._currentGenerator = f.call(
        {},
        {
          goForward: function* () {
            yield self._commandAsync(Command.goForward);
          },
          turnLeft: function* () {
            yield self._commandAsync(Command.turnLeft);
          },
          turnRight: function* () {
            yield self._commandAsync(Command.turnRight);
          },
          noTurn: function* () {
            yield self._commandAsync(Command.noTurn);
          },
          load: function* () {
            yield self._commandAsync(Command.load);
          },
          unload: function* () {
            yield self._commandAsync(Command.unload);
          },
          wait: function* () {
            yield self._commandAsync(Command.wait);
          },
          pause: function* () {
            yield self._commandAsync(Command.pause);
          },
          doNothing: function* () {
            yield self._commandAsync(Command.doNothing);
          },

          lightIsRed: () => this.sensor(Sensor.lightIsRed),
          lightIsGreen: () => this.sensor(Sensor.lightIsGreen),
          canGoStraight: () => this.sensor(Sensor.canGoStraight),
          canTurnLeft: () => this.sensor(Sensor.canTurnLeft),
          canTurnRight: () => this.sensor(Sensor.canTurnRight),
          canLoad: () => this.sensor(Sensor.canLoad),
          canUnload: () => this.sensor(Sensor.canUnload),
          isOnTarget: () => this.sensor(Sensor.isOnTarget),
          isSolved: () => this.sensor(Sensor.isSolved),

          _progress: progressCallback,
        }
      );

      await this._resumeCode();
    } catch (error) {
      if (typeof error.msg !== "undefined") {
        // Forward the "nice" errors
        throw error;
      } else {
        // Display the "bad" errors
        console.error(error);
        alert(error);
      }
    } finally {
      this.commandInProgress.next(false);
      progressCallback(undefined);
    }
  }

  /**
   * Resumes execution of a previously paused program.
   */
  async resumeCode() {
    this.codeShouldPause.next(false);
    this.commandInProgress.next(true);

    try {
      await this._resumeCode();
    } catch (error) {
      if (typeof error.msg !== "undefined") {
        // Forward the "nice" errors
        throw error;
      } else {
        // Display the "bad" errors
        console.error(error);
        alert(error);
      }
    } finally {
      this.commandInProgress.next(false);
    }
  }

  /**
   * Executes the generator als long as it's not finished or paused.
   */
  private async _resumeCode() {
    if (this._currentGenerator) {
      let result: IteratorResult<any>;
      while (
        !this.codeShouldPause.value &&
        !(result = this._currentGenerator.next()).done
      ) {
        await result.value;
      }
    }
  }

  /**
   * Pauses the code currently running asap.
   */
  pauseCode() {
    this.codeShouldPause.next(true);
  }

  /**
   * Converts the current state to a WorldDescription
   * @return the world description
   */
  currentStateToDescription(): WorldDescription {
    function toFreightColorDesc(
      freight: Freight
    ): WorldFreightColorDescription {
      return {
        [Freight.Red]: "Red",
        [Freight.Green]: "Green",
        [Freight.Blue]: "Blue",
      }[freight] as WorldFreightColorDescription;
    }

    function toTruckDesc(state: WorldState): WorldTruckDescription {
      const truck = state.truck;
      return {
        position: { x: truck.position.x, y: truck.position.y },
        facing: DirectionUtil.toChar(truck.facingDirection),
        freight: truck.freight.map(toFreightColorDesc),
      };
    }

    function toTrafficLightDesc(
      direction: Direction,
      trafficLight: TrafficLight
    ): WorldTrafficLightDescription {
      return {
        opening: DirectionUtil.toChar(direction),
        redPhase: trafficLight.redPhase,
        greenPhase: trafficLight.greenPhase,
        startPhase: trafficLight.initial,
      };
    }

    function toTrafficLightsDesc(
      trafficLights: TrafficLight[]
    ): WorldTrafficLightDescription[] {
      const result: WorldTrafficLightDescription[] = [];
      for (let i = 0; i < trafficLights.length; i++) {
        const light = trafficLights[i];
        if (!light) {
          continue;
        }
        const direction = DirectionUtil.fromNumber(i);
        result.push(toTrafficLightDesc(direction, light));
      }
      return result;
    }

    function toTileDesc(tile: Tile): WorldTileDescription {
      return {
        position: { x: tile.position.x, y: tile.position.y },
        openings: DirectionUtil.openingToDirectionArray(tile.openings).map(
          DirectionUtil.toChar
        ),
        freight: tile.freight.map(toFreightColorDesc),
        freightTarget: tile.freightTarget
          ? toFreightColorDesc(tile.freightTarget)
          : undefined,
        trafficLights: toTrafficLightsDesc(tile.trafficLights),
      };
    }

    function toWorldDesc(state: WorldState): WorldDescription {
      return {
        size: { width: state.size.width, height: state.size.height },
        trucks: [toTruckDesc(state)],
        tiles: state.tiles.map(toTileDesc),
      };
    }

    return toWorldDesc(this.state);
  }
}

/**
 * State of a world.
 */
export class WorldState {
  [immerable] = true;

  /** Time steps that are sheduled for the execution of this step.  */
  time: number;

  /** Size of the world. */
  size: Size;

  /** Tiles from left to right and top to bottom. */
  tiles: Array<Tile>;

  /** Truck. */
  truck: Truck;

  /**
   * Initializes a new state of the world.
   * @param size The size of the world.
   * @param tiles Tiles from left to right and top to bottom.
   * @param truck Truck.
   * @param time Time steps that are sheduled for the execution of this step.
   */
  constructor(size: Size, tiles: Tile[], truck: Truck, time: number = 0) {
    this.size = size;
    this.tiles = tiles;
    this.truck = truck;
    this.time = time;
  }

  /**
   * Returns the time steps past in this step and all previous steps.
   * @return time steps.
   */
  get timeStep(): number {
    return this.time;
  }

  /**
   * Returns the tile at the passed position.
   * @param pos Position of the requested tile.
   * @return Tile at the passed position.
   */
  getTile(pos: Position): Tile {
    if (pos.x >= this.size.width) {
      return undefined; // Out of range
    }
    return this.tiles[pos.y * this.size.width + pos.x];
  }

  /**
   * Indicates whether all freight has been delivered to their destination.
   * @return True, when all freight has been delivered to their destination,
   *         otherwise false.
   */
  get solved(): boolean {
    return (
      this.truck.freightItems === 0 &&
      !this.tiles.some((t) => t.freightItems > 0)
    );
  }

  /**
   * Returns all positions of direct neighbors that can be reached by the current position.
   * Directly means going north, east, south or west _NOT_ diagonal.
   * When the center position is at the worldborder the result might contain less than 4 elements.
   * @param center The center position
   * @return An array of all direct neighbor positions
   */
  public getDirectNeighbors(center: Position): Position[] {
    const result: Position[] = [];

    const north = new Position(center.x, center.y - 1);
    if (north.y >= 0) {
      result.push(north);
    }

    const east = new Position(center.x + 1, center.y);
    if (east.x < this.size.width) {
      result.push(east);
    }

    const south = new Position(center.x, center.y + 1);
    if (south.y < this.size.height) {
      result.push(south);
    }

    const west = new Position(center.x - 1, center.y);
    if (west.x >= 0) {
      result.push(west);
    }

    return result;
  }

  // Mutation functions
  /**
   * Will resize the current world state.
   * Newly created tiles will be empty.
   * Truncated tiles will be removed.
   * @param newSize the new width and height of the world
   * @return true if a change has occurred
   */
  public resize(newSize: number): boolean {
    if (this.size.width === newSize && this.size.height === newSize) {
      return false; // No change
    }
    const isShrinking = newSize < this.size.width || newSize < this.size.height;

    const newTileArray: Tile[] = [];
    for (let y = 0; y < newSize; y++) {
      for (let x = 0; x < newSize; x++) {
        const pos = new Position(x, y);
        const currentTile = this.getTile(pos);
        if (isShrinking) {
          // We dont have to have a straight road into the world border
          if (pos.x === newSize - 1) {
            currentTile.resetDirection(Direction.East);
          }
          if (pos.y === newSize - 1) {
            currentTile.resetDirection(Direction.South);
          }
        }
        newTileArray.push(currentTile || new Tile(pos, TileOpening.None));
      }
    }

    this.tiles = newTileArray;
    this.size = new Size(newSize, newSize);

    return true;
  }

  /**
   * Will reset a tile to an empty tile. (All openings and features will be removed)
   * @param pos Position of the tile that should be resetted
   * @return true if a tile was really changed
   */
  public resetTile(pos: Position): boolean {
    const thisTile = this.getTile(pos);

    let wasChanged = thisTile.reset();

    // cutLooseOpenings will ensure that all other tiles have a nice corner
    // If you want to have hard cuts in the world just comment out the following line
    wasChanged = this.cutLooseOpenings(pos) || wasChanged;

    // TODO: Find a way to delete the truck start point

    return wasChanged;
  }

  /**
   * Calls resetTile on each tile
   * @return true if a change has occurred
   */
  public resetAllTiles(): boolean {
    let modifiedAtLeastOne = false;
    for (const tile of this.tiles) {
      if (tile.reset()) {
        modifiedAtLeastOne = true;
      }
    }
    return modifiedAtLeastOne;
  }

  private cutLooseOpenings(center: Position): boolean {
    let modifiedAtLeastOneTile = false;
    // After deleting the current tile, we also want to remove the connections that lead to this tile.
    for (const neighborPos of this.getDirectNeighbors(center)) {
      const deletedDirection = DirectionUtil.getDirectionToPos(
        center,
        neighborPos
      );
      const tile = this.getTile(neighborPos);
      if (tile.resetDirection(DirectionUtil.opposite(deletedDirection))) {
        modifiedAtLeastOneTile = true;
      }
    }
    return modifiedAtLeastOneTile;
  }

  /**
   * The to position must be exactly one tile be away from the form pos
   * @param fromPos the start
   * @param toPos the end
   * @return true if a change has occurred
   */
  public connectTilesWithRoad(fromPos: Position, toPos: Position): boolean {
    const direction = DirectionUtil.getDirectionToPos(fromPos, toPos);
    if (!direction) {
      // We might have some incorrect positions.
      // This can occur if the client lags, and we get for example Pos(0,0) and then Pos(1,1)
      return false;
    }

    const fromTile = this.getTile(fromPos);
    const toTile = this.getTile(toPos);

    const fromOpening = DirectionUtil.toTileOpening(direction);
    const toOpening = DirectionUtil.toTileOpening(
      DirectionUtil.opposite(direction)
    );

    if (fromTile.openings & fromOpening && toTile.openings & toOpening) {
      return false; // This opening was already connected
    }

    fromTile.openings |= fromOpening;
    toTile.openings |= toOpening;
    return true;
  }
}

/**
 * Truck.
 */
export class Truck {
  [immerable] = true;

  /** Position on the field. */
  position: Position;

  /** Current direction of travel of the truck (n * 90) starting from 0 = west. */
  facing: number;

  /** Turn signal. */
  turning: TurnDirection;

  /** Freight. */
  freight: Array<Freight>;

  /**
   * Initializes a truck.
   * @param position Position on the field.
   * @param facing Current direction of travel of the truck.
   * @param freight Freight.
   */
  constructor(
    position: Position,
    facing: number,
    freight: Array<Freight> = [],
    turning: TurnDirection = TurnDirection.Straight
  ) {
    this.position = position;
    this.facing = facing;
    this.freight = freight;
    this.turning = turning;
  }

  /**
   * Loads a freight.
   * @param freight Freight.
   */
  loadFreight(freight: Freight) {
    this.freight.push(freight);
  }

  /**
   * Unloads a freight and returns it.
   * @param n Position of the freight.
   * @return Freight unloaded, null if no freight was unloaded.
   */
  unloadFreight(n: number = 0): Freight {
    const freight = this.freightItem(n);
    if (freight != null) {
      this.freight.splice(n, 1);
    }
    return freight;
  }

  /**
   * Returns the number of loaded freight items.
   * @return Number of freight items.
   */
  get freightItems(): number {
    return this.freight.length;
  }

  /**
   * Returns a certain freight item.
   * @param n Position of the freight.
   * @return Freight.
   */
  freightItem(n: number = 0): Freight {
    return this.freightItems > n ? this.freight[n] : null;
  }

  /**
   * Returns the color of the freight, null if empty.
   * @param n Position of the freight.
   * @return Color of the freight, null if empty.
   */
  freightColor(n: number = 0): string {
    return this.freightItem(n);
  }

  /**
   * Returns the direction of travel of the truck.
   * @return Direction of travel.
   */
  get facingDirection(): Direction {
    const f = this.facing;
    if (f % 4 === 1 || f % 4 === -3) {
      return Direction.East;
    }
    if (f % 4 === 2 || f % 4 === -2) {
      return Direction.South;
    }
    if (f % 4 === 3 || f % 4 === -1) {
      return Direction.West;
    }
    return Direction.North;
  }

  /**
   * Returns the direction of travel after a forward movement in response to the
   * turn signal.
   * @return Direction after forward movement.
   */
  get facingDirectionAfterMove(): Direction {
    return DirectionUtil.turn(this.facingDirection, this.turning);
  }

  /**
   * Returns the position after a forward movement.
   * @return Position after forward movement.
   */
  get positionAfterMove(): Position {
    const pos = this.position.clone();
    if (this.facingDirectionAfterMove === Direction.North) {
      pos.y--;
    } else if (this.facingDirectionAfterMove === Direction.East) {
      pos.x++;
    } else if (this.facingDirectionAfterMove === Direction.South) {
      pos.y++;
    } else if (this.facingDirectionAfterMove === Direction.West) {
      pos.x--;
    }
    return pos;
  }

  move(turnDirection: TurnDirection = null) {
    // Overwrite turning direction
    if (turnDirection != null) {
      this.turning = turnDirection;
    }

    // New direction of travel and position
    this.position = this.positionAfterMove;
    this.facing += this.turning;

    // Turn off the turn signal
    this.turning = TurnDirection.Straight;
  }

  /**
   * Overwrites the current turn direction.
   * @param turnDirection Direction to turn in next.
   */
  turn(turnDirection: TurnDirection) {
    this.turning = turnDirection;
  }
}

/**
 * Tile on the field.
 */
export class Tile {
  [immerable] = true;

  /** Position on the field. */
  position: Position;

  /** Specifies in which directions the tile is passable. */
  openings: TileOpening;

  /**  Freight on the tile. */
  freight: Array<Freight>;

  /**
   * Specifies which freight target is on the tile, null if none. There must be
   * no freight on a tile with a target.
   */
  freightTarget: Freight | null;

  /**
   * Traffic lights in the order north, east, south, west. Fill unused traffic
   * lights with null
   */
  trafficLights: Array<TrafficLight>;

  /**
   * Initializes a tile.
   * @param position Position on the field.
   * @param openings Directions in which the tile is passable.
   * @param freight Freight.
   * @param freightTarget Freight target.
   * @param trafficLights Traffic lights.
   */
  constructor(
    position: Position,
    openings: TileOpening,
    freight: Array<Freight> = [],
    freightTarget: Freight = null,
    trafficLights: Array<TrafficLight> = []
  ) {
    this.position = position;
    this.openings = openings;
    this.freight = freight;
    this.freightTarget = freightTarget;
    this.trafficLights = trafficLights;
  }

  /**
   * Returns whether the field is passable in a certain direction.
   * @param direction Direction to be checked.
   * @return True if passable in the direction, otherwise false.
   */
  hasOpeningInDirection(direction: Direction): boolean {
    return this.hasOpening(DirectionUtil.toTileOpening(direction));
  }

  /**
   * Returns whether the field is passable in a certain direction.
   * @param opening Direction to be checked.
   * @return True if passable in the direction, otherwise false.
   */
  hasOpening(opening: TileOpening): boolean {
    return (this.openings & opening) === opening;
  }

  /**
   * Checks if the tile is a curve.
   * @return True, if the tile is a curve, otherwise false.
   */
  isCurve(): boolean {
    return (
      this.openings === (TileOpening.North | TileOpening.East) ||
      this.openings === (TileOpening.East | TileOpening.South) ||
      this.openings === (TileOpening.South | TileOpening.West) ||
      this.openings === (TileOpening.North | TileOpening.West)
    );
  }

  /**
   * Specifies the direction in which the truck must turn on a curve.
   * @param direction Driving direction of the truck.
   * @return Turn direction, undefined if tile is not a curve.
   */
  curveTurnDirection(direction: Direction): TurnDirection {
    return this.hasOpeningInDirection(
      DirectionUtil.turn(direction, TurnDirection.Left)
    )
      ? TurnDirection.Left
      : TurnDirection.Right;
  }

  /**
   * Returns the number of pieces of freight on the tile.
   * @return Number of pieces of freight.
   */
  get freightItems(): number {
    return this.freight.length;
  }

  /**
   * Returns a freight from the field.
   * @param n Number of the freight.
   * @return Freight.
   */
  freightItem(n: number = 0): Freight {
    return this.freightItems > n ? this.freight[n] : null;
  }

  /**
   * Adds a freight on the field.
   * The field must be empty(still have a road) and if it has a fright target the color must match
   * @param freight Freight.
   * @return true if a change has occurred
   */
  tryAddFreight(freight: Freight): boolean {
    if (
      this.freight.length !== 0 || // Cannot have a fright already on it
      this.openings === TileOpening.None || // Must have openings
      this.freightTarget !== null // FreightTarget must be empty
    ) {
      return false;
    }
    this.freight.push(freight);
    return true;
  }

  /**
   * Sets the fright target
   * @param freight the new target
   * @return true if a change has occurred
   */
  setFrightTarget(freight: Freight | null): boolean {
    if (
      this.freight.length !== 0 || // Cannot have a fright already on it
      this.openings === TileOpening.None || // Must have openings
      this.freightTarget !== null // FreightTarget must be empty
    ) {
      return false;
    }
    this.freightTarget = freight;
    return true;
  }

  /**
   * Removes freight from the field.
   * @param n Number of the freight.
   * @return Removed freight.
   */
  removeFreight(n: number = 0): Freight {
    const freight = this.freightItem(n);
    if (freight != null) {
      this.freight.splice(n, 1);
    }
    return freight;
  }

  removeFreightsOrTarget(): boolean {
    if (this.freightTarget === null && this.freight.length == 0) {
      return false;
    }

    this.freightTarget = null;
    this.freight = [];
    return true;
  }

  /**
   * Returnes the color of the freight or target.
   * @return Color of the freight or target.
   */
  freightColor(n: number = 0): string {
    if (this.freightTarget) {
      return this.freightTarget;
    }
    return this.freightItem(n);
  }

  /**
   * Returns the traffic light that regulates the traffic coming from the
   * specified direction.
   * @param direction Direction.
   * @return Traffic light if existing, otherwise null.
   */
  trafficLight(direction: Direction): TrafficLight | null {
    const n = DirectionUtil.toNumber(direction);
    return this.trafficLights.length > n ? this.trafficLights[n] : null;
  }

  public reset(): boolean {
    if (this.openings === TileOpening.None) {
      return false;
    }
    this.openings = TileOpening.None;
    this.trafficLights = this.trafficLights.map((tl) => null);
    this.freightTarget = null;
    this.freight = [];
    return true;
  }

  public resetDirection(direction: Direction): boolean {
    const opening = DirectionUtil.toTileOpening(direction);
    if (!(this.openings & opening)) {
      return false;
    }
    if (this.openings == opening) {
      return this.reset();
    }

    this.openings &= ~opening;

    this.removeTrafficLight(direction);
  }

  /**
   * Sets a traffic light at for a given direction
   * @param direction the direction of the traffic light
   * @param newTrafficLight the configuration of this traffic light
   * @return true if a change has occurred
   */
  public setTrafficLight(
    direction: Direction,
    newTrafficLight: TrafficLight
  ): boolean {
    if (!this.hasOpeningInDirection(direction)) {
      return false; // Has no opening in this direction
    }
    const dirNumber = DirectionUtil.toNumber(direction);
    const currentTrafficLight = this.trafficLights[dirNumber];
    if (
      currentTrafficLight &&
      currentTrafficLight.redPhase == newTrafficLight.redPhase &&
      currentTrafficLight.greenPhase == newTrafficLight.greenPhase &&
      currentTrafficLight.initial == newTrafficLight.initial
    ) {
      return false; // no change has occurred
    }
    this.trafficLights[dirNumber] = newTrafficLight;
    return true;
  }

  /**
   * Removes a traffic light for a given direction
   * @param direction the direction of the traffic light that should be removed
   * @return true if a change has occurred
   */
  public removeTrafficLight(direction: Direction): boolean {
    const dirNumber = DirectionUtil.toNumber(direction);
    if (this.trafficLights[dirNumber]) {
      this.trafficLights[dirNumber] = null;
      return true;
    }
    return false;
  }
}

/**
 * Traffic light.
 */
export class TrafficLight {
  [immerable] = true;

  /** Duration of the red phase in steps. */
  redPhase: number;

  /** Duration of the green phase in steps. */
  greenPhase: number;

  /** Step at which counting should start. */
  initial: number;

  /**
   * Initializes the traffic light.
   * @param redPhase Duration of the red phase in steps.
   * @param greenPhase Duration of the green phase in steps.
   * @param initial Step at which counting should start.
   */
  constructor(redPhase: number, greenPhase: number, initial: number = 0) {
    this.redPhase = redPhase;
    this.greenPhase = greenPhase;
    this.initial = initial;
  }

  /**
   * Returns whether the traffic light in the given step is red.
   * @param step Step for which the traffic light state is to be calculated.
   * @return True if the traffic light is red, otherwise false.
   */
  isRed(step: number): boolean {
    return (
      (step + this.initial) % (this.redPhase + this.greenPhase) < this.redPhase
    );
  }

  /**
   * Returns whether the traffic light in the given step is green.
   * @param step Step for which the traffic light state is to be calculated.
   * @return True if the traffic light is green, otherwise false.
   */
  isGreen(step: number): boolean {
    return !this.isRed(step);
  }
}

/**
 * Size from width and height.
 */
export class Size {
  [immerable] = true;

  /**
   * Initializes a size.
   * @param width Width.
   * @param height Height.
   */
  constructor(public width: number, public height: number) {}

  /**
   * Creates a copy of the size.
   * @return Copy of the size.
   */
  clone(): Size {
    return new Size(this.width, this.height);
  }

  public isEqual(other: Size): boolean {
    return this.width == other.width && this.height == other.height;
  }
}

/**
 * 2D position.
 */
export class Position {
  [immerable] = true;

  /**
   * Initializes the position.
   * @param x X-position.
   * @param y Y-position.
   */
  constructor(public x: number, public y: number) {}

  /**
   * Creates a copy of the position.
   * @return Copy of the position.
   */
  clone(): Position {
    return new Position(this.x, this.y);
  }

  /**
   * Checks if a position equals another position
   * @param other the other position, can be null or undefined
   * @return true if equal
   */
  public isEqual(other?: Position): boolean {
    return other && this.x === other.x && this.y === other.y;
  }
}

/**
 * Type of freight.
 */
export enum Freight {
  /** Red. */
  Red = "red",

  /** Green. */
  Green = "green",

  /** Blue. */
  Blue = "blue",
}

/**
 * Bitmask for the passable edges of a tile.
 */
export enum TileOpening {
  /** No opening. */
  None = 0,

  /** North. */
  North = 1 << 0,

  /** East. */
  East = 1 << 1,

  /** South. */
  South = 1 << 2,

  /** West. */
  West = 1 << 3,

  /** Shorthands. */
  N = North,
  E = East,
  S = South,
  W = West,
}

/**
 * Direction.
 */
export enum Direction {
  /** North. */
  North = "North",

  /** East. */
  East = "East",

  /** South. */
  South = "South",

  /** West. */
  West = "West",
}

/**
 * Helper class for `Direction`
 */
export class DirectionUtil {
  /**
   * Returns the opposite direction of a given direction.
   * @param direction Direction.
   * @return Opposite direction.
   */
  public static opposite(direction: Direction) {
    return {
      [Direction.North]: Direction.South,
      [Direction.East]: Direction.West,
      [Direction.South]: Direction.North,
      [Direction.West]: Direction.East,
    }[direction];
  }

  /**
   * Returns the corresponding `TileOpening` for a given direction.
   * @param direction Direction.
   */
  public static toTileOpening(direction: Direction): TileOpening {
    return {
      [Direction.North]: TileOpening.North,
      [Direction.East]: TileOpening.East,
      [Direction.South]: TileOpening.South,
      [Direction.West]: TileOpening.West,
    }[direction];
  }

  /**
   * Returns the corresponding number for a given direction.
   * (north = 0, east = 1, south = 2, west = 3)
   * @param direction Direction.
   * @return the corresponding number
   */
  public static toNumber(direction: Direction): number {
    return {
      [Direction.North]: 0,
      [Direction.East]: 1,
      [Direction.South]: 2,
      [Direction.West]: 3,
    }[direction];
  }

  /**
   * Returns the corresponding number for a given direction.
   * (0 = north, 1 = east, 2 = south, 3 = west)
   * @param number the directionNumber
   * @return the corresponding direction
   */
  public static fromNumber(number: number): Direction {
    return [Direction.North, Direction.East, Direction.South, Direction.West][
      number
    ];
  }

  /**
   * Returns the direction after a turn.
   * @param direction Direction.
   * @param turnDirection Turning direction.
   * @return New direction.
   */
  public static turn(
    direction: Direction,
    turnDirection: TurnDirection
  ): Direction {
    if (turnDirection === TurnDirection.Straight) {
      return direction;
    }
    return {
      [TurnDirection.Left]: {
        [Direction.North]: Direction.West,
        [Direction.East]: Direction.North,
        [Direction.South]: Direction.East,
        [Direction.West]: Direction.South,
      },
      [TurnDirection.Right]: {
        [Direction.North]: Direction.East,
        [Direction.East]: Direction.South,
        [Direction.South]: Direction.West,
        [Direction.West]: Direction.North,
      },
    }[turnDirection][direction];
  }

  /**
   * Returns the direction for a string.
   * @param c Direction as string (N, E, S, W).
   * @return Direction.
   */
  public static fromChar(c: WorldDirectionDescription): Direction {
    return {
      N: Direction.North,
      E: Direction.East,
      S: Direction.South,
      W: Direction.West,
    }[c];
  }

  /**
   * Converts a direction into a char
   * @param d the direction
   * @return The direction as a char (N, E, S, W)
   */
  public static toChar(d: Direction): WorldDirectionDescription {
    return {
      [Direction.North]: "N",
      [Direction.East]: "E",
      [Direction.South]: "S",
      [Direction.West]: "W",
    }[d] as WorldDirectionDescription;
  }

  /**
   * Will split a TileOpening combined with ORs to its atomic direction parts
   * e.g. (TileOpening.North | TileOpening.South) => [Direction.North, Direction.South]
   * @param opening the combined opening
   * @return an array of direction parts
   */
  public static openingToDirectionArray(opening: TileOpening): Direction[] {
    const result = [];
    if (opening & TileOpening.North) result.push(Direction.North);
    if (opening & TileOpening.East) result.push(Direction.East);
    if (opening & TileOpening.South) result.push(Direction.South);
    if (opening & TileOpening.West) result.push(Direction.West);
    return result;
  }

  /**
   * Get the direction to navigate from on tile to another.
   * The tiles must be directly connectable, otherwise the result will be _undefined_.
   * @param fromPos the first tile position
   * @param toPos the second tile position
   * @return the direction
   */
  static getDirectionToPos(
    fromPos: Position,
    toPos: Position
  ): Direction | undefined {
    const dX = toPos.x - fromPos.x;
    const dY = toPos.y - fromPos.y;

    let dir: Direction = undefined;
    if (dX === 0 && dY === 1) {
      dir = Direction.South; // Up to Down
    } else if (dX === 0 && dY === -1) {
      dir = Direction.North; // Down to Up
    } else if (dX === 1 && dY === 0) {
      dir = Direction.East; // Left to Right
    } else if (dX === -1 && dY === 0) {
      dir = Direction.West; // Right to Left
    }

    return dir;
  }
}

/**
 * Turning direction.
 */
export enum TurnDirection {
  /** Straight. */
  Straight = 0,

  /** Left. */
  Left = -1,

  /** Right. */
  Right = +1,
}

/** Executable commands. */
export enum Command {
  /** Go forward, if possible. */
  goForward,

  /** Set turn signal left. */
  turnLeft,

  /** Set turn signal right. */
  turnRight,

  /** Turn off turn signal. */
  noTurn,

  /** Load freight if possible. */
  load,

  /** Unload freight if possible. */
  unload,

  /** Wait a step without activity. */
  wait,

  /** Pause execution until further notice. */
  pause,

  /** Do nothing, but still check if program should terminate. */
  doNothing,
}

/** Sensors. */
export enum Sensor {
  /** Is the traffic light in front of the truck red? */
  lightIsRed,

  /** Is the traffic light in front of the truck green? */
  lightIsGreen,

  /** Can the truck go straight? */
  canGoStraight,

  /** Can the truck turn left? */
  canTurnLeft,

  /** Can the truck turn right? */
  canTurnRight,

  /** Can the truck load here? */
  canLoad,

  /** Can the truck unload here? */
  canUnload,

  /** Is the Truck on a target? */
  isOnTarget,

  /** Is the world solved? */
  isSolved,
}

/** General Exception. */
export class TruckError extends Error {
  readonly expected: boolean = false;
  readonly msg: string = "";
}

/** Exception while trying to leave the paved road. */
export class StrayedOffTheRoadError extends TruckError {
  readonly msg: string = "Dein Lastwagen wäre fast von der Straße abgekommen!";
}

/** Exception while crossing a red traffic light. */
export class RedLightViolationError extends TruckError {
  readonly msg: string = "Du hättest fast eine Rote Ampel übersehen!";
}

/** Exception while loading. */
export class LoadingError extends TruckError {
  readonly msg: string = "Hier kannst du nichts laden!";
}

/** Exception while unloading. */
export class UnloadingError extends TruckError {
  readonly msg: string = "Hier kannst du nichts abladen!";
}
