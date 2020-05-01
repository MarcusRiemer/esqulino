import { BehaviorSubject } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { Position } from "../../../shared/syntaxtree/truck/world";

export class TruckWorldMouseService {
  private readonly _leftMouseButtonDown = new BehaviorSubject<boolean>(false);
  private readonly _rightMouseDown = new BehaviorSubject<boolean>(false);
  private readonly _currentPosition = new BehaviorSubject<Position>(undefined);

  // Public Observables
  public readonly leftMouseButtonDown = this._leftMouseButtonDown.asObservable();
  public readonly rightMouseButtonDown = this._rightMouseDown.asObservable();
  public readonly currentPosition = this._currentPosition.pipe(
    distinctUntilChanged(
      (a, b) =>
        // Technically we only check if the X/Y coordinates are the same, not if it's the same world
        a && b && a.x == b.x && a.y == b.y
    )
  );

  // Event handlers
  public fireLeftMouseButtonDown(): void {
    this._leftMouseButtonDown.next(true);
  }
  public fireRightMouseButtonDown(): void {
    this._rightMouseDown.next(true);
  }

  public fireLeftMouseButtonUp(): void {
    this._leftMouseButtonDown.next(false);
  }
  public fireRightMouseButtonUp(): void {
    this._rightMouseDown.next(false);
  }

  public updateCursorPos(pos?: Position): void {
    this._currentPosition.next(pos);
  }
}
