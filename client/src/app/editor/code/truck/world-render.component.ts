import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  NgZone,
} from "@angular/core";
import { Subscription } from "rxjs";

import { TruckWorldService } from "./truck-world.service";
import { Renderer } from "./renderer";
import { TruckWorldMouseService } from "./truck-world-mouse.service";
import { Position, World } from "../../../shared/syntaxtree/truck/world";

const MOUSE_BUTTON_LEFT = 0;
const MOUSE_BUTTON_RIGHT = 2;

@Component({
  templateUrl: "templates/world-render.html",
})
export class WorldRenderComponent implements OnInit, OnDestroy {
  @ViewChild("canvas", { static: true }) _canvasRef: ElementRef;

  private _renderer: Renderer;
  private _subscriptions: Subscription[] = [];

  // Holds an array of functions that will remove event listeners
  private _eventListenerRemovers: Function[] = [];

  // Will be needed to calculate the tile position
  private _currentWorld: World;

  constructor(
    private _mouse: TruckWorldMouseService,
    private _truckWorld: TruckWorldService,
    private _ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const worldSubscription = this._truckWorld.currentWorld.subscribe(
      (world) => {
        this._currentWorld = world;

        // If there's already a renderer, stop it
        if (this._renderer) {
          this._renderer.stop();
        }

        // Initialize renderer with canvas context
        this._renderer = new Renderer(
          world,
          this._canvasRef.nativeElement as HTMLCanvasElement
        );

        this.addMouseListener();

        // Calling the `render` function outside of the Angular zone, as it calls
        // itself recursively over and over again and should not make any changes to
        // the state of the world.
        this._ngZone.runOutsideAngular(() => {
          this._renderer.render();
        });
      }
    );
    this._subscriptions.push(worldSubscription);
  }

  ngOnDestroy(): void {
    if (this._renderer) {
      this._renderer.stop();
    }

    this._subscriptions.forEach((s) => {
      s.unsubscribe();
    });

    this._subscriptions = [];

    this.removeMouseListener();
  }

  private addMouseListener(): void {
    const canvas = this._canvasRef.nativeElement as HTMLCanvasElement;
    this.addRemovableEventListener(canvas, "mouseleave", () => {
      this._mouse.onLeftMouseButtonUp();
      this._mouse.onRightMouseButtonUp();
      this._mouse.updateCursorPos(undefined);
    });
    this.addRemovableEventListener(canvas, "mousedown", (ev) => {
      if (ev.button == MOUSE_BUTTON_LEFT) {
        this._mouse.onLeftMouseButtonDown();
      } else if (ev.button == MOUSE_BUTTON_RIGHT) {
        this._mouse.onRightMouseButtonDown();
      }
    });
    this.addRemovableEventListener(canvas, "mouseup", (ev) => {
      if (ev.button == MOUSE_BUTTON_LEFT) {
        this._mouse.onLeftMouseButtonUp();
      } else if (ev.button == MOUSE_BUTTON_RIGHT) {
        this._mouse.onRightMouseButtonUp();
      }
    });
    this.addRemovableEventListener(canvas, "mousemove", (ev) => {
      if (!this._currentWorld) {
        return; // We need a world in order to
      }
      // Bounding box of the canvas
      const bb = canvas.getBoundingClientRect();

      // rel{x,y} float value from 0 to 1
      const relX = (ev.clientX - bb.left) / (bb.right - bb.left);
      const relY = (ev.clientY - bb.top) / (bb.bottom - bb.top);

      // tile{x,y} integer value from 0 to (this._currentWorld.size.{width,height} - 1)
      const tileX = Math.floor(relX * this._currentWorld.size.width);
      const tileY = Math.floor(relY * this._currentWorld.size.height);

      this._mouse.updateCursorPos(
        new Position(tileX, tileY, this._currentWorld)
      );
    });
    this.addRemovableEventListener(canvas, "contextmenu", (ev) => {
      ev.preventDefault(); // Disable right click context menu
    });
  }

  private removeMouseListener(): void {
    // Call all removers (removeEventListener)
    for (const remover of this._eventListenerRemovers) {
      remover();
    }
    this._eventListenerRemovers = [];
  }

  private addRemovableEventListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    type: K,
    listener: (ev: HTMLElementEventMap[K]) => void
  ): void {
    this._eventListenerRemovers.push(() => {
      element.removeEventListener(type, listener);
    });
    element.addEventListener(type, listener);
  }
}
