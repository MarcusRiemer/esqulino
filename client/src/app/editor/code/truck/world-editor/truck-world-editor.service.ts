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

@Injectable({ providedIn: "root" })
export class TruckWorldEditorService implements OnDestroy {
  private _subscriptions: Subscription[] = [];

  private _leftMouseDownPosUpdaterSubscription?: Subscription;
  private _rightMouseDownPosUpdaterSubscription?: Subscription;

  private _editorModeEnabled = false;

  private _feature = new BehaviorSubject<TruckFeature<any>>({
    feature: TruckTileFeatureType.Road,
    options: null,
  });

  // Public Observable
  public readonly feature = this._feature.asObservable();

  constructor(
    private _mouse: TruckWorldMouseService,
    private _currentCodeResource: CurrentCodeResourceService
  ) {
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
  ): void {
    const openings = World.getRoadOpeningsBetween(fromPos, toPos);
    if (!openings) {
      // We might have some incorrect positions.
      // This can occur if the client lags, and we get for example Pos(0,0) and then Pos(1,1)
      return;
    }

    state.getTile(fromPos).openings |= openings.from;
    state.getTile(toPos).openings |= openings.to;
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

  private removeRoadPart(state: WorldState, pos: Position): void {
    state.getTile(pos).openings = TileOpening.None;
    // After deleting the current tile, we also want to remove the connections that lead to this tile.
    for (const neighborPos of pos.getDirectNeighbors()) {
      const { to } = World.getRoadOpeningsBetween(pos, neighborPos);
      state.getTile(neighborPos).openings &= ~to; // Remove this part from the neighbor
    }
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
    // TODO
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
   * @param modifier state modifier function
   */
  private mutateWorldAndCode(
    world: World,
    modifier: (state: WorldState) => void
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
   * @param modifier state modifier function
   */
  private mutateWorld(
    world: World,
    modifier: (state: WorldState) => void
  ): void {
    world.mutateState((s) => {
      modifier(s);
      return s;
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
