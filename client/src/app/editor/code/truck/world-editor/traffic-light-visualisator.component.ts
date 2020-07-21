import { Component, Input } from "@angular/core";
import { TruckTrafficLightTileFeatureOptions } from "./truck-world-editor.service";

@Component({
  selector: "TrafficLightVisualisator",
  templateUrl: "templates/traffic-light-visualisator.html",
})
export class TrafficLightVisualisator {
  @Input()
  options: TruckTrafficLightTileFeatureOptions;

  constructor() {}
}
