import { Injectable, OnDestroy } from "@angular/core";
import {
  Freight,
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
            case TruckTileFeatureType.FreightTarget:
              this.placeFrightTarget();
              break;
            case TruckTileFeatureType.Freight:
              this.placeFright();
              break;
            case TruckTileFeatureType.TrafficLight:
              this.placeTrafficLight();
              break;
          }
        } else {
          this.stopDrawRoad();
        }
      })
    );
    this._subscriptions.push(
      this._mouse.rightMouseButtonDown.subscribe((isDown) => {
        if (isDown && this._editorModeEnabled) {
          switch (this._feature.getValue().feature) {
            case TruckTileFeatureType.Road:
              this.startDestroyRoad();
              break;
            case TruckTileFeatureType.FreightTarget:
            case TruckTileFeatureType.Freight:
              this.removeFrightsOrTarget();
              break;
          }
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
          this.mutateWorldAndCode(this._world, (s) =>
            s.connectTilesWithRoad(prevPos, pos)
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

  private startDestroyRoad(): void {
    this.stopDestroyRoad();

    this._rightMouseDownPosUpdaterSubscription = this._mouse.currentPosition.subscribe(
      (pos) => {
        if (!pos) return;

        this.mutateWorldAndCode(this._world, (s) => s.resetTile(pos));
      }
    );
  }

  private stopDestroyRoad(): void {
    this._rightMouseDownPosUpdaterSubscription?.unsubscribe();
    this._rightMouseDownPosUpdaterSubscription = undefined;
  }

  private placeFright(): void {
    const worldFreight = TruckWorldEditorService.frightFeatureAsWorldFright(
      this._feature.getValue()
    );
    this.mutateWorldAndCode(this._world, (s) =>
      s.getTile(this._mouse.peekCurrentPosition).tryAddFreight(worldFreight)
    );
  }

  private placeFrightTarget(): void {
    const worldFreight = TruckWorldEditorService.frightFeatureAsWorldFright(
      this._feature.getValue()
    );
    this.mutateWorldAndCode(this._world, (s) =>
      s.getTile(this._mouse.peekCurrentPosition).setFrightTarget(worldFreight)
    );
  }

  private removeFrightsOrTarget() {
    this.mutateWorldAndCode(this._world, (s) =>
      s.getTile(this._mouse.peekCurrentPosition).removeFreightsOrTarget()
    );
  }

  private placeTrafficLight(): void {
    const trafficLightFeature = this._feature.getValue() as TruckFeature<
      TruckTileFeatureType.TrafficLight
    >;
    console.log("would place traffic light with", trafficLightFeature.options);
    this.mutateWorldAndCode(this._world, (s) => false);
  }

  public resizeWorld(newSize: number): void {
    if (newSize >= 2 && newSize <= 15) {
      this.mutateWorldAndCode(this._world, (s) => s.resize(newSize));
    }
  }

  /*
   * General functions
   */

  private static frightFeatureAsWorldFright(
    feature: TruckFeature<
      TruckTileFeatureType.Freight | TruckTileFeatureType.FreightTarget
    >
  ): Freight {
    return Freight[feature.options];
  }

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
    this.updateCodeResource(this._world);
  }

  /**
   * Reset all changes that were made
   */
  public resetChanges(): void {
    this._world.reset();
    this.updateCodeResource(this._world);
  }

  /**
   * Overrides the current world with an empty one (size will stay the same)
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
    this.updateCodeResource(world);
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

  private updateCodeResource(world: World) {
    const newDescription = world.currentStateToDescription();
    const newTree = worldDescriptionToNode(newDescription);
    this._currentCodeResource.peekResource.replaceSyntaxTree(newTree);
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
