import { Component, NgZone, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { World } from "../../../../shared/syntaxtree/truck/world";

import { TruckWorldService } from "../truck-world.service";
import {
  TruckFeature,
  TruckTileFeatureType,
  TruckWorldEditorService,
} from "./truck-world-editor.service";

@Component({
  templateUrl: "templates/truck-world-editor.html",
})
export class TruckWorldEditorComponent implements OnInit, OnDestroy {
  private _subscriptions: Subscription[] = [];

  private _currentWorld?: World;

  public tileFeatureType = TruckTileFeatureType; // Required to use the enum inside the template
  public feature$ = this._editor.feature;

  constructor(
    private _truckWorld: TruckWorldService,
    private _ngZone: NgZone,
    private _editor: TruckWorldEditorService
  ) {}

  public ngOnInit(): void {
    this._subscriptions.push(
      this._truckWorld.currentWorld.subscribe((world) => {
        this._currentWorld = world;
      })
    );
  }

  public ngOnDestroy(): void {
    this._subscriptions.forEach((s) => {
      s.unsubscribe();
    });

    this._subscriptions = [];
  }

  public get size(): number {
    return this._currentWorld?.state.size.width;
  }

  public set size(value: number) {
    this._editor.resizeWorld(Number(value));
  }

  public undo(): void {
    this._editor.undo();
  }

  public resetChanges(): void {
    this._editor.resetChanges();
  }

  public resetEverything(): void {
    this._editor.resetEverything();
  }
}
