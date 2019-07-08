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
  readonly currentWorld = this._truckWorld.currentWorld;

  constructor(
    private _truckWorld: TruckWorldService,
    private _ngZone: NgZone
  ) {
  }

  /**
   * The current value of the parent that hosts the rendering canvas.
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

  /**
   * Dimensions that should be used during rendering. Must be initialized
   * in ngOnInit because the ElementRef to the canvas is not available earlier.
   */
  public renderingDimensions: BehaviorSubject<RenderingDimensions>;

  ngOnInit(): void {
    // Listen to changes to the size of the window
    this.parentWidth = fromEvent(window, 'resize').pipe(
      map((_: UIEvent) => this.parentWidthPeek),
      startWith(this.parentWidthPeek),
      shareReplay(1)
    );

    // Setup the dimension calculation
    this.renderingDimensions = new BehaviorSubject<RenderingDimensions>({
      height: this.parentWidthPeek,
      width: this.parentWidthPeek
    });

    // And actually react to changing dimensions
    const parentWidthSubscription = this.parentWidth.subscribe(width => {
      this.emitCurrentDimensions();
    });
    this._subscriptions.push(parentWidthSubscription);

    // Get canvas context
    const ctx: CanvasRenderingContext2D = this._canvasRef.nativeElement.getContext('2d');

    const worldSubscription = this._truckWorld.currentWorld.subscribe(world => {
      // If there's already a renderer, stop it
      if (this._renderer) {
        this._renderer.stop();
      }

      // Initialize renderer with canvas context
      this._renderer = new Renderer(world, ctx, this.renderingDimensions);

      // Calling the `render` function outside of the Angular zone, as it calls
      // itself recursively over and over again and should not make any changes to
      // the state of the world.
      this._ngZone.runOutsideAngular(() => {
        this.emitCurrentDimensions(); // TODO: This re-calculation should not be necessary
        this._renderer.render();
      });
    });
    this._subscriptions.push(worldSubscription);
  }

  private emitCurrentDimensions() {
    const width = this.parentWidthPeek;
    this.renderingDimensions.next({
      height: width,
      width: width
    });
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
