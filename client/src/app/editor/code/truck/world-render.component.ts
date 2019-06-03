import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Subscription, Observable, fromEvent } from 'rxjs';

import { TruckWorldService } from './truck-world.service'
import { Renderer } from './renderer';
import { map, startWith, shareReplay } from 'rxjs/operators';

@Component({
  templateUrl: 'templates/world-render.html',
})
export class WorldRenderComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: false }) _canvasRef: ElementRef;

  private _renderer: Renderer;
  private _worldSubscription: Subscription;
  readonly currentWorld = this._truckWorld.currentWorld;

  constructor(
    private _truckWorld: TruckWorldService,
    private _ngZone: NgZone
  ) {
  }

  /**
   * The current value of the
   */
  get parentWidthPeek() {
    const domCanvas: HTMLCanvasElement = this._canvasRef.nativeElement;
    return (domCanvas.parentElement.offsetWidth);
  }

  /**
   * Always up to date value of the desired width for the canvas. Must be initialized
   * in ngOnInit because the ElementRef to the canvas is not available earlier.
   */
  public parentWidth: Observable<number>;

  ngOnInit(): void {
    this.parentWidth = fromEvent(window, 'resize').pipe(
      map((_: UIEvent) => this.parentWidthPeek),
      startWith(this.parentWidthPeek),
      shareReplay(1)
    );

    // Get canvas context
    const ctx: CanvasRenderingContext2D = this._canvasRef.nativeElement.getContext('2d');

    this._worldSubscription = this._truckWorld.currentWorld.subscribe(world => {
      // If there's already a renderer, stop it
      if (this._renderer) {
        this._renderer.stop();
      }

      // Initialize renderer with canvas context
      this._renderer = new Renderer(world, ctx, this.parentWidthPeek, this.parentWidthPeek);

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
