import { BehaviorSubject } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { Direction, Position } from "../../../shared/syntaxtree/truck/world";

export interface WorldPosWithDirection {
  pos: Position;
  direction: Direction;
}

export class TruckWorldMouseService {
  private readonly _leftMouseButtonDown = new BehaviorSubject<boolean>(false);
  private readonly _rightMouseDown = new BehaviorSubject<boolean>(false);
  private readonly _currentPosition = new BehaviorSubject<
    WorldPosWithDirection
  >(undefined);

  // Public Observables
  public readonly leftMouseButtonDown = this._leftMouseButtonDown.asObservable();
  public readonly rightMouseButtonDown = this._rightMouseDown.asObservable();
  public readonly currentPosition = this._currentPosition.pipe(
    distinctUntilChanged(
      (a, b) => a && b && a.pos.isEqual(b.pos) && a.direction === b.direction
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

  public updateCursorPos(pos?: WorldPosWithDirection): void {
    this._currentPosition.next(pos);
  }
  public get peekCurrentPosition(): WorldPosWithDirection | undefined {
    return this._currentPosition.value;
  }
}
