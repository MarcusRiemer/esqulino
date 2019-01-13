import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';

import { TruckWorldService } from './truck-world.service'
import { Renderer } from './renderer';

@Component({
  templateUrl: 'templates/world-render.html',
})
export class WorldRenderComponent implements OnInit, OnDestroy {
  @ViewChild('canvas') canvasRef: ElementRef;

  readonly canvasWidth = 500;
  readonly canvasHeight = 500;
  private _renderer: Renderer;
  private _worldSubscription: Subscription;
  readonly currentWorld = this._truckWorld.currentWorld;

  constructor(
    private _truckWorld: TruckWorldService,
    private _ngZone: NgZone
  ) {
  }

  ngOnInit(): void {
    // Get canvas context
    const ctx: CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext('2d');

    this._worldSubscription = this._truckWorld.currentWorld.subscribe(world => {
      // If there's already a renderer, stop it
      if (this._renderer) {
        this._renderer.stop();
      }

      // Initialize renderer with canvas context
      this._renderer = new Renderer(world, ctx, this.canvasWidth, this.canvasHeight);

      // Calling the `render` function outside of the Angular zone, as it calls
      // itself recursively over and over again and should not make any changes to
      // the state of the world.
      this._ngZone.runOutsideAngular(() => this._renderer.render());
    });
  }

  ngOnDestroy(): void {
    if (this._worldSubscription) {
      this._worldSubscription.unsubscribe();
    }
    if (this._renderer) {
      this._renderer.stop();
    }
  }
}
