import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

class ObservableValue<T> {
  private _value = new BehaviorSubject<T>(undefined);

  constructor(initialValue: T) {
    this._value.next(initialValue);
  }

  readonly value$: Observable<T> = this._value;

  get value() {
    return this._value.value;
  }
  set value(v: T) {
    this._value.next(v);
  }
}

@Injectable()
export class BlockDebugOptionsService {
  /**
   * Should the editable AST be rendered (instead of the "normal" block language)
   */
  readonly showEditableAst = new ObservableValue<boolean>(false);

  /**
   * Should the JSON AST be rendered?
   */
  readonly showJsonAst = new ObservableValue<boolean>(false);

  /**
   * Options to change languages for code resources.
   */
  readonly showLanguageSelector = new ObservableValue<boolean>(false);

  /**
   * Debugging aid for drag & drop
   */
  readonly showDropDebug = new ObservableValue<boolean>(false);
}
