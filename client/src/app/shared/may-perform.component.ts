import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { filter, map, shareReplay, startWith, switchMap } from "rxjs/operators";
import { UserService } from "./auth/user.service";

import { MayPerformRequestDescription } from "./may-perform.description";

@Component({
  selector: "may-perform",
  templateUrl: "./templates/may-perform.html",
})
export class MayPerformComponent implements OnChanges {
  @Input()
  payload: MayPerformRequestDescription;

  private _payload$ = new BehaviorSubject<MayPerformRequestDescription>(
    undefined
  );

  constructor(private _userService: UserService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["payload"]) {
      this._payload$.next(this.payload);
    }
  }

  readonly mayPerform$ = this._payload$.pipe(
    filter((payload) => !!payload),
    switchMap((req) => this._userService.mayPerform$(req)),
    map((res) => res.perform),
    startWith(false),
    shareReplay(1)
  );
}
