import { Component, Output, EventEmitter } from "@angular/core";
import { pluck } from "rxjs/operators";

import { LoginProvidersGQL } from "../../../generated/graphql";

@Component({
  selector: "providers-all-buttons",
  templateUrl: "./templates/providers-all-buttons.html",
})
export class ProvidersAllButtonsComponent {
  @Output() trigger = new EventEmitter();

  constructor(private _loginProviders: LoginProvidersGQL) {}

  /**
   * All available providers
   */
  readonly providers$ = this._loginProviders
    .watch()
    .valueChanges.pipe(pluck("data", "loginProviders"));

  /**
   * Will be used for forwarding a click of the blattwerkzeug provider
   */
  public onTrigger(): void {
    this.trigger.emit();
  }
}
