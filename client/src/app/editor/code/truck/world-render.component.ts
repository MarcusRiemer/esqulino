import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { CurrentCodeResourceService } from '../../current-coderesource.service';

import { TruckWorldService } from './truck-world.service'


@Component({
  templateUrl: 'templates/world-render.html',
})
export class WorldRenderComponent implements OnInit, OnDestroy {
  private _renderSubscription: Subscription;

  constructor(
    private _truckState: TruckWorldService,
    private _currentCodeResource: CurrentCodeResourceService
  ) {
  }

  readonly currentWorld = this._truckState.currentWorld;

  readonly currentProgram = this._currentCodeResource.currentResource;

  ngOnDestroy(): void {
    if (this._renderSubscription) {
      this._renderSubscription.unsubscribe();
    }
  }
  ngOnInit(): void {
    this._renderSubscription = this._truckState.currentWorld.subscribe(state => {
      //replaceState(state);
    });
  }

}