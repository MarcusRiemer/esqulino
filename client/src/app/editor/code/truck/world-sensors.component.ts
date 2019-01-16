import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { TruckWorldService } from './truck-world.service'
import { World, Sensor } from '../../../shared/syntaxtree/truck/world';

@Component({
  templateUrl: 'templates/world-sensors.html',
})
export class WorldSensorsComponent implements OnInit, OnDestroy {
  private _worldSubscription: Subscription;
  public world: World;
  readonly currentWorld = this._truckWorld.currentWorld;

  constructor(private _truckWorld: TruckWorldService) { }

  ngOnInit(): void {
    this._worldSubscription = this._truckWorld.currentWorld.subscribe(world => {
      this.world = world;
    });
  }

  ngOnDestroy(): void {
    if (this._worldSubscription) {
      this._worldSubscription.unsubscribe();
    }
  }

  get sensorLightIsRed() { return this.world.sensor(Sensor.lightIsRed); }
  get sensorLightIsGreen() { return this.world.sensor(Sensor.lightIsGreen); }
  get sensorCanGoStraight() { return this.world.sensor(Sensor.canGoStraight); }
  get sensorCanTurnLeft() { return this.world.sensor(Sensor.canTurnLeft); }
  get sensorCanTurnRight() { return this.world.sensor(Sensor.canTurnRight); }
  get sensorIsSolved() { return this.world.sensor(Sensor.isSolved); }
}
