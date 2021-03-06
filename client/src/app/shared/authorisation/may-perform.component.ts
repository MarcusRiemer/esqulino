import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { filter, map, shareReplay, startWith, switchMap } from "rxjs/operators";

import { MayPerformService } from "./may-perform.service";
import { MayPerformRequestDescription } from "./may-perform.description";

/**
 * Wraps components to be shown or not shown depending on the
 * result of a "may perform" request. You may specify a single
 * attribute "denied" to display contents in the case of a
 * "forbidden" response.
 */
@Component({
  selector: "may-perform",
  templateUrl: "./templates/may-perform.html",
})
export class MayPerformComponent implements OnChanges, OnInit, OnDestroy {
  /**
   * The permissions to check.
   */
  @Input()
  payload: MayPerformRequestDescription;

  @Input()
  showOnForbidden = false;

  private _payload$ = new BehaviorSubject<MayPerformRequestDescription>(
    undefined
  );

  constructor(private _mayPerform: MayPerformService) {}

  ngOnInit(): void {
    this._payload$.next(this.payload);
  }

  ngOnDestroy() {
    // "Close" this subject, just in case there might be a dangling
    // subscription to it.
    // console.debug("MayPerformComponent::ngOnDestroy()", this.payload);
    this._payload$.complete();
  }

  // Used to feed the Subject for the permission request
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["payload"]) {
      this._payload$.next(this.payload);
    }
  }

  readonly showContent$ = this._payload$.pipe(
    filter((payload) => !!payload),
    switchMap((req) => this._mayPerform.mayPerform$(req)),
    map((res) => res.perform === !this.showOnForbidden),
    startWith(false),
    shareReplay(1)
  );
}
