import { Injectable, OnDestroy } from "@angular/core";
import {
  Position,
  TileOpening,
  World,
  WorldState,
} from "../../../../shared/syntaxtree/truck/world";
import { BehaviorSubject, Subscription } from "rxjs";
import { TruckWorldMouseService } from "../truck-world-mouse.service";
import { CurrentCodeResourceService } from "../../../current-coderesource.service";
import {
  worldDescriptionToNode,
  WorldFreightColorDescription,
} from "../../../../shared/syntaxtree/truck/world.description";
import { TruckWorldService } from "../truck-world.service";

@Injectable()
export class TruckWorldEditorService implements OnDestroy {
  private _subscriptions: Subscription[] = [];

  private _leftMouseDownPosUpdaterSubscription?: Subscription;
  private _rightMouseDownPosUpdaterSubscription?: Subscription;
  private _world?: World;

  private _editorModeEnabled = false;

  private _feature = new BehaviorSubject<TruckFeature<any>>({
    feature: TruckTileFeatureType.Road,
    options: null,
  });

  // Public Observable
  public readonly feature = this._feature.asObservable();

  constructor(
    private _mouse: TruckWorldMouseService,
    private _currentCodeResource: CurrentCodeResourceService,
    worldService: TruckWorldService
  ) {
    this._subscriptions.push(
      worldService.currentWorld.subscribe((world) => {
        this._world = world;
      })
    );

    this._currentCodeResource.currentResource.subscribe((currentProgram) => {
      if (currentProgram.emittedLanguageIdPeek === "truck-world") {
        this.enableEditorMode();
      } else if (this._editorModeEnabled) {
        this.disableEditorMode();
      }
    });

    this._subscriptions.push(
      this._mouse.leftMouseButtonDown.subscribe((isDown) => {
        if (isDown && this._editorModeEnabled) {
          switch (this._feature.getValue().feature) {
            case TruckTileFeatureType.Road:
              this.startDrawRoad();
              break;
          }
        } else {
          this.stopDrawRoad();
        }
      })
    );
    this._subscriptions.push(
      this._mouse.rightMouseButtonDown.subscribe((isDown) => {
        if (
          isDown &&
          this._editorModeEnabled &&
          this._feature.getValue().feature === TruckTileFeatureType.Road
        ) {
          this.startDestroyRoad();
        } else {
          this.stopDestroyRoad();
        }
      })
    );
  }

  public ngOnDestroy(): void {
    this._subscriptions.forEach((s) => {
      s.unsubscribe();
    });

    this._subscriptions = [];

    this.disableEditorMode();
  }

  public enableEditorMode(): void {
    this._editorModeEnabled = true;
  }

  public disableEditorMode(): void {
    this._editorModeEnabled = false;
    this.stopDrawRoad();
    this.stopDestroyRoad();
  }

  /*
   * Road
   */
  private startDrawRoad() {
    this.stopDrawRoad();

    let prevPos: Position | undefined;
    this._leftMouseDownPosUpdaterSubscription = this._mouse.currentPosition.subscribe(
      (pos) => {
        if (!pos) return;

        if (prevPos) {
          this.mutateWorldAndCode(pos.world, (s) =>
            this.addRoadPart(s, prevPos, pos)
          );
        }
        prevPos = pos;
      }
    );
  }

  private stopDrawRoad() {
    this._leftMouseDownPosUpdaterSubscription?.unsubscribe();
    this._leftMouseDownPosUpdaterSubscription = undefined;
  }

  private addRoadPart(
    state: WorldState,
    fromPos: Position,
    toPos: Position
  ): boolean {
    const openings = World.getRoadOpeningsBetween(fromPos, toPos);
    if (!openings) {
      // We might have some incorrect positions.
      // This can occur if the client lags, and we get for example Pos(0,0) and then Pos(1,1)
      return false;
    }

    const fromTile = state.getTile(fromPos);
    const toTile = state.getTile(toPos);
    if (fromTile.openings & openings.from && toTile.openings & openings.to) {
      return false; // This opening was already connected
    }

    fromTile.openings |= openings.from;
    toTile.openings |= openings.to;
    return true;
  }

  private startDestroyRoad(): void {
    this.stopDestroyRoad();

    this._rightMouseDownPosUpdaterSubscription = this._mouse.currentPosition.subscribe(
      (pos) => {
        if (!pos) return;

        this.mutateWorldAndCode(pos.world, (s) => this.removeRoadPart(s, pos));
      }
    );
  }

  private stopDestroyRoad(): void {
    this._rightMouseDownPosUpdaterSubscription?.unsubscribe();
    this._rightMouseDownPosUpdaterSubscription = undefined;
  }

  /**
   * Removes all connections of a road // TODO Also remove all other tile features
   * @param state the state that should be modified
   * @param pos the position
   * @return true if a change occurred
   */
  private removeRoadPart(state: WorldState, pos: Position): boolean {
    state.getTile(pos).openings = TileOpening.None;
    let modifiedOneTile = false;
    // After deleting the current tile, we also want to remove the connections that lead to this tile.
    for (const neighborPos of pos.getDirectNeighbors()) {
      const { to } = World.getRoadOpeningsBetween(pos, neighborPos);
      const tile = state.getTile(neighborPos);
      if (tile.openings & to) {
        modifiedOneTile = true;
      }
      tile.openings &= ~to; // Remove this part from the neighbor
    }
    return modifiedOneTile;
  }

  public resizeWorld(x: number, y: number): void {
    // TODO
    console.log("Would resize world to ", x, y);
  }

  /*
   * General functions
   */

  /**
   * Selects a feature
   * @param feature the feature
   * @param options the options of this feature
   */
  public selectTileFeature<F extends keyof TileFeatureTypeToOptions>(
    feature: F,
    options: TileFeatureTypeToOptions[F]
  ): void {
    this._feature.next({
      feature,
      options,
    });
  }

  /**
   * Reverts the last change
   */
  public undo(): void {
    this._world.undo();
  }

  /**
   * Reset all changes that were made
   */
  public resetChanges(): void {
    // TODO
  }

  /**
   * Overrides the current world with an empty 5x5 one
   */
  public resetEverything(): void {
    // TODO
  }

  /**
   * Mutates the world state with a given function
   * And also replaces the syntax tree
   * @param world thr world that should be mutated
   * @param modifier state modifier function. (Must return true in order to apply changes)
   */
  private mutateWorldAndCode(
    world: World,
    modifier: (state: WorldState) => boolean
  ): void {
    this.mutateWorld(world, modifier);
    const newDescription = world.currentStateToDescription();
    const newTree = worldDescriptionToNode(newDescription);
    this._currentCodeResource.peekResource.replaceSyntaxTree(newTree);
  }

  /**
   * Mutates the world state with a given function
   * (Useful for functions that should not change the syntax tree, like blueprints)
   * @param world thr world that should be mutated
   * @param modifier state modifier function. (Must return true in order to apply changes)
   */
  private mutateWorld(
    world: World,
    modifier: (state: WorldState) => boolean
  ): void {
    world.mutateState((s) => {
      // If the modifier returns true, the change was valid
      return modifier(s) ? s : null;
    });
  }
}

/**
 * Stores a feature with the options of this feature
 */
export interface TruckFeature<F extends keyof TileFeatureTypeToOptions> {
  feature: F;
  options: TileFeatureTypeToOptions[F];
}

/**
 * All possible feature types that can be applied to the world
 */
export enum TruckTileFeatureType {
  Road,
  TrafficLight,
  Freight,
  FreightTarget,
  TruckSpawn,
}

/**
 * The options of features
 */
interface TileFeatureTypeToOptions {
  [TruckTileFeatureType.Road]: void;
  [TruckTileFeatureType.TrafficLight]: TruckTrafficLightTileFeatureOptions;
  [TruckTileFeatureType.Freight]: TruckFreightTileFeatureOptions;
  [TruckTileFeatureType.FreightTarget]: TruckFreightTileFeatureOptions;
  [TruckTileFeatureType.TruckSpawn]: void;
}

export type TruckFreightTileFeatureOptions = WorldFreightColorDescription;

export interface TruckTrafficLightTileFeatureOptions {
  redPhase: number;
  greenPhase: number;
  startPhase: number;
}
