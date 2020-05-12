import { Component, NgZone, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { World } from "../../../../shared/syntaxtree/truck/world";

import { TruckWorldService } from "../truck-world.service";
import {
  TruckFreightTileFeatureOptions,
  TruckTileFeatureType,
  TruckWorldEditorService,
} from "./truck-world-editor.service";

@Component({
  templateUrl: "templates/truck-world-editor.html",
  styleUrls: ["templates/truck-world-editor.css"],
})
export class TruckWorldEditorComponent implements OnInit, OnDestroy {
  public tileFeatureType = TruckTileFeatureType;

  private _subscriptions: Subscription[] = [];

  private _currentWorld?: World;

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

  public get sizeX(): number {
    return this._currentWorld?.size.width;
  }

  public set sizeX(value: number) {
    this._editor.resizeWorld(value, this.sizeY);
  }

  public get sizeY(): number {
    return this._currentWorld?.size.height;
  }

  public set sizeY(value: number) {
    this._editor.resizeWorld(this.sizeX, value);
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

  public selectRoad() {
    this._editor.selectTileFeature(TruckTileFeatureType.Road, null);
  }

  public selectTrafficLight() {
    this._editor.selectTileFeature(TruckTileFeatureType.TrafficLight, {
      greenPhase: 2,
      redPhase: 2,
      startPhase: 0,
    });
  }

  public selectFight(color: TruckFreightTileFeatureOptions) {
    this._editor.selectTileFeature(TruckTileFeatureType.Freight, color);
  }

  public selectFightTarget(color: TruckFreightTileFeatureOptions) {
    this._editor.selectTileFeature(TruckTileFeatureType.FreightTarget, color);
  }

  public selectTruckSpawn() {
    this._editor.selectTileFeature(TruckTileFeatureType.TruckSpawn, null);
  }
}
