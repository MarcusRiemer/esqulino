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
  indicator: Observable<boolean>;

  // Parent element is shown if initiator matches the value of the indicator.
  @Input()
  initiator: boolean;

  @HostBinding("class.hide")
  hide: boolean;

  subs: Subscription[] = [];

  constructor() {}

  ngOnInit(): void {
    this.subs.push(
      this.indicator.subscribe(
        (condition) => (this.hide = condition === this.initiator)
      )
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
