import {
  Directive,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { Observable, Subscription } from "rxjs";

@Directive({
  selector: "[conditionalDisplay]",
})
export class ConditionalDisplayDirective implements OnDestroy, OnInit {
  // The hide class will be set for parent if value changes
  @Input()
  private _indicator: Observable<boolean>;

  // Parent element is hidden if initiator matches the value of the indicator.
  @Input()
  private _initiator: boolean;

  // Css class .hide is set to host element when _hide is true
  @HostBinding("class.hide")
  private _hide: boolean;

  subs: Subscription[] = [];

  constructor() {}

  ngOnInit(): void {
    this.subs.push(
      this._indicator.subscribe(
        (condition) => (this._hide = condition === this._initiator)
      )
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
