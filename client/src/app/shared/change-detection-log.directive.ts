import { Directive, Input, DoCheck, AfterViewChecked } from "@angular/core";

import { environment } from "../../environments/environment";

/**
 * Logs various lifecycle events of the component that this directive
 * is attached to. Mainly used to pin down performance problems with the
 * recursive AST rendering.
 */
@Directive({
  selector: "[changeDetectionLog]",
})
export class ChangeDetectionLogDirective implements DoCheck, AfterViewChecked {
  @Input()
  changeDetectionLog = "default";

  ngDoCheck(): void {
    if (environment.debugLogging.changeDetection && console.time) {
      console.time(this.changeDetectionLog);
    }
  }

  ngAfterViewChecked(): void {
    if (environment.debugLogging.changeDetection && console.timeEnd) {
      console.timeEnd(this.changeDetectionLog);
    }
  }
}
