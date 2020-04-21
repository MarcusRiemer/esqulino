import { Injectable, NgZone, OnDestroy } from "@angular/core";
import {
  Position,
  TileOpening,
  World,
  WorldState,
} from "../../../../shared/syntaxtree/truck/world";
import { Subscription } from "rxjs";
import { TruckWorldMouseService } from "../truck-world-mouse.service";

@Injectable({ providedIn: "root" })
export class TruckWorldEditorService implements OnDestroy {
  private _subscriptions: Subscription[] = [];

  private _leftMouseDownPosUpdaterSubscription?: Subscription;
  private _rightMouseDownPosUpdaterSubscription?: Subscription;

  private _editorModeEnabled = false;

  constructor(private _ngZone: NgZone, private _mouse: TruckWorldMouseService) {
    this._subscriptions.push(
      this._mouse.leftMouseButtonDown.subscribe((isDown) => {
        if (!this._editorModeEnabled) {
          return;
        }
        if (isDown) {
          this.startDrawRoad();
        } else {
          this.stopDrawRoad();
        }
      })
    );
    this._subscriptions.push(
      this._mouse.rightMouseButtonDown.subscribe((isDown) => {
        if (!this._editorModeEnabled) {
          return;
        }
        if (isDown) {
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

  private startDrawRoad() {
    this.stopDrawRoad();

    let prevPos: Position | undefined;
    this._leftMouseDownPosUpdaterSubscription = this._mouse.currentPosition.subscribe(
      (pos) => {
        if (!pos) return;

        if (prevPos) {
          pos.world.mutateState((state) =>
            this.addRoadPart(state, prevPos, pos)
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
  ): WorldState {
    const openings = World.getRoadOpeningsBetween(fromPos, toPos);
    if (!openings) {
      // We might have some incorrect positions.
      // This can occur if the client lags, and we get for example Pos(0,0) and then Pos(1,1)
      return state;
    }

    state.getTile(fromPos).openings |= openings.from;
    state.getTile(toPos).openings |= openings.to;

    return state;
  }

  private startDestroyRoad(): void {
    this.stopDestroyRoad();

    this._rightMouseDownPosUpdaterSubscription = this._mouse.currentPosition.subscribe(
      (pos) => {
        if (!pos) return;

        pos.world.mutateState((state) => {
          state.getTile(pos).openings = TileOpening.None;
          // After deleting the current tile, we also want to remove the connections that lead to this tile.
          for (const neighborPos of pos.getDirectNeighbors()) {
            const { to } = World.getRoadOpeningsBetween(pos, neighborPos);
            state.getTile(neighborPos).openings &= ~to; // Remove this part from the neighbor
          }

          return state;
        });
      }
    );
  }

  private stopDestroyRoad(): void {
    this._rightMouseDownPosUpdaterSubscription?.unsubscribe();
    this._rightMouseDownPosUpdaterSubscription = undefined;
  }
}
