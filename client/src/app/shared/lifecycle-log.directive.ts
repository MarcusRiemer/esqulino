import { Directive, OnInit, OnDestroy, Input } from "@angular/core";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

type ComponentCounter = Record<string, number>;

/**
 * Logs various lifecycle events of the component that this directive
 * is attached to. Mainly used to pin down performance problems with the
 * recursive AST rendering.
 */
@Directive({
  selector: "[lifecycleLog]",
})
export class LifecycleLogDirective implements OnInit, OnDestroy {
  private static readonly InitCounter: ComponentCounter = {};
  private static readonly DestroyCounter: ComponentCounter = {};

  private static readonly statsMessage = new Subject<{
    init: ComponentCounter;
    destroy: ComponentCounter;
  }>();

  private static outputSubscription = (() =>
    LifecycleLogDirective.statsMessage
      .pipe(debounceTime(100))
      .subscribe(console.table))();

  @Input()
  lifecycleLog = "default";

  ngOnInit(): void {
    LifecycleLogDirective.InitCounter[this.lifecycleLog] =
      (LifecycleLogDirective.InitCounter[this.lifecycleLog] ?? 0) + 1;
    LifecycleLogDirective.logMessage();
  }

  ngOnDestroy(): void {
    LifecycleLogDirective.DestroyCounter[this.lifecycleLog] =
      (LifecycleLogDirective.DestroyCounter[this.lifecycleLog] ?? 0) + 1;
    LifecycleLogDirective.logMessage();
  }

  private static logMessage() {
    LifecycleLogDirective.statsMessage.next({
      init: LifecycleLogDirective.InitCounter,
      destroy: LifecycleLogDirective.DestroyCounter,
    });
  }
}
