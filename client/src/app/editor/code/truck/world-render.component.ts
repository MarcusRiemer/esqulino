import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Subscription, Observable, fromEvent, BehaviorSubject } from 'rxjs';

import { TruckWorldService } from './truck-world.service'
import { Renderer, RenderingDimensions } from './renderer';
import { map, startWith, shareReplay } from 'rxjs/operators';

@Component({
  templateUrl: 'templates/world-render.html',
})
export class WorldRenderComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) _canvasRef: ElementRef;

  private _renderer: Renderer;
  private _subscriptions: Subscription[] = [];

  constructor(
    private _truckWorld: TruckWorldService,
    private _ngZone: NgZone
  ) {
  }

  ngOnInit(): void {
    const worldSubscription = this._truckWorld.currentWorld.subscribe(world => {
      // If there's already a renderer, stop it
      if (this._renderer) {
        this._renderer.stop();
      }

      // Initialize renderer with canvas context
      this._renderer = new Renderer(world, this._canvasRef.nativeElement as HTMLCanvasElement);

      // Calling the `render` function outside of the Angular zone, as it calls
      // itself recursively over and over again and should not make any changes to
      // the state of the world.
      this._ngZone.runOutsideAngular(() => {
        this._renderer.render();
      });
    });
    this._subscriptions.push(worldSubscription);
  }

  ngOnDestroy(): void {
    if (this._renderer) {
      this._renderer.stop();
    }

    this._subscriptions.forEach(s => {
      s.unsubscribe();
    });

    this._subscriptions = [];
  }
}
