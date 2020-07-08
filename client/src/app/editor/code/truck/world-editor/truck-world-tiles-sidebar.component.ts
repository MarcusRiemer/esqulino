import { Component } from "@angular/core";
import {
  TruckFreightTileFeatureOptions,
  TruckTileFeatureType,
  TruckWorldEditorService,
} from "./truck-world-editor.service";

@Component({
  templateUrl: "templates/truck-world-tiles-sidebar.html",
})
export class TruckWorldTilesSidebarComponent {
  public tileFeatureType = TruckTileFeatureType; // Required to use the enum inside the template

  public feature$ = this._editor.feature;

  constructor(private _editor: TruckWorldEditorService) {}

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

  public selectFreight(color: TruckFreightTileFeatureOptions) {
    this._editor.selectTileFeature(TruckTileFeatureType.Freight, color);
  }

  public selectFreightTarget(color: TruckFreightTileFeatureOptions) {
    this._editor.selectTileFeature(TruckTileFeatureType.FreightTarget, color);
  }

  public selectTruckSpawn() {
    this._editor.selectTileFeature(TruckTileFeatureType.TruckSpawn, null);
  }
}
