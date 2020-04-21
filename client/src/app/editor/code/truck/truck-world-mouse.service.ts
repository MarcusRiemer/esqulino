import { BehaviorSubject, Observable } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { Position } from "../../../shared/syntaxtree/truck/world";

export class TruckWorldMouseService {
  private _leftMouseButtonDown = new BehaviorSubject<boolean>(false);
  private _rightMouseDown = new BehaviorSubject<boolean>(false);
  private _currentPosition = new BehaviorSubject<Position>(undefined);

  // Getter for Observables
  public get leftMouseButtonDown(): Observable<boolean> {
    return this._leftMouseButtonDown;
  }

  public get rightMouseButtonDown(): Observable<boolean> {
    return this._rightMouseDown;
  }

  public get currentPosition(): Observable<Position | undefined> {
    return this._currentPosition.pipe(
      distinctUntilChanged(
        (a, b) =>
          // Technically we only check if the X/Y coordinates are the same, not if it's the same world
          a && b && a.x == b.x && a.y == b.y
      )
    );
  }

  // Event handlers
  public onLeftMouseButtonDown(): void {
    this._leftMouseButtonDown.next(true);
  }
  public onRightMouseButtonDown(): void {
    this._rightMouseDown.next(true);
  }

  public onLeftMouseButtonUp(): void {
    this._leftMouseButtonDown.next(false);
  }
  public onRightMouseButtonUp(): void {
    this._rightMouseDown.next(false);
  }

  public updateCursorPos(pos?: Position): void {
    this._currentPosition.next(pos);
  }
}
