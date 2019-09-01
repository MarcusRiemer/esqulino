import { Component, Output, EventEmitter } from "@angular/core";

import { UserService } from './user.service';
@Component({
  selector: "providers-all-buttons",
  templateUrl: "./templates/providers-all-buttons.html"
})
export class ProvidersAllButtonsComponent {
  @Output() trigger = new EventEmitter();

  constructor(
    private _userService: UserService
  ) { }

  /**
   * All available providers
   */
  readonly providers$ = this._userService.providerList$

  /**
   * Will be used for forwarding a click of the blattwerkzeug provider
   */
  public onTrigger(): void {
    this.trigger.emit()
  }
}
