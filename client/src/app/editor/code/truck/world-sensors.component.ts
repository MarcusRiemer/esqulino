import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

import { TruckWorldService } from "./truck-world.service";
import { World, Sensor } from "../../../shared/syntaxtree/truck/world";

@Component({
  templateUrl: "templates/world-sensors.html",
})
export class WorldSensorsComponent implements OnInit, OnDestroy {
  private _worldSubscription: Subscription;
  public world: World;

  constructor(private _truckWorld: TruckWorldService) {}

  ngOnInit(): void {
    this._worldSubscription = this._truckWorld.currentWorld.subscribe(
      (world) => {
        this.world = world;
      }
    );
  }

  ngOnDestroy(): void {
    if (this._worldSubscription) {
      this._worldSubscription.unsubscribe();
    }
  }

  get sensorLightIsRed() {
    return this.getSensor(Sensor.lightIsRed);
  }
  get sensorLightIsGreen() {
    return this.getSensor(Sensor.lightIsGreen);
  }
  get sensorCanGoStraight() {
    return this.getSensor(Sensor.canGoStraight);
  }
  get sensorCanTurnLeft() {
    return this.getSensor(Sensor.canTurnLeft);
  }
  get sensorCanTurnRight() {
    return this.getSensor(Sensor.canTurnRight);
  }
  get sensorCanLoad() {
    return this.getSensor(Sensor.canLoad);
  }
  get sensorCanUnload() {
    return this.getSensor(Sensor.canUnload);
  }
  get sensorIsOnTarget() {
    return this.getSensor(Sensor.isOnTarget);
  }
  get sensorIsSolved() {
    return this.getSensor(Sensor.isSolved);
  }

  getSensor(sensor: Sensor): boolean {
    return this.world ? this.world.sensor(sensor) : false;
  }

  className(value: boolean): string {
    return value ? "text-success" : "text-danger";
  }
}
