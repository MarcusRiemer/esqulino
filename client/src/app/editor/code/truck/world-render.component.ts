import { Component, OnInit, OnDestroy } from '@angular/core';

import { TruckWorldService } from './truck-world.service'
import { Subscription } from 'rxjs';

@Component({
  templateUrl: 'templates/world-render.html',
})
export class WorldRenderComponent implements OnInit, OnDestroy {
  private _renderSubscription: Subscription;

  constructor(private _truckState: TruckWorldService) {
  }

  ngOnDestroy(): void {
    if (this._renderSubscription) {
      this._renderSubscription.unsubscribe();
    }
  }
  ngOnInit(): void {
    this._renderSubscription = this._truckState.currentWorld.subscribe(state => {
      replaceState(state);
    });
  }

}