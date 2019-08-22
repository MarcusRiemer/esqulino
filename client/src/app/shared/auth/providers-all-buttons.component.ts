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

  readonly providers$ = this._userService.providerList$

  public triggerd(): void {
    this.trigger.emit()
  }
}
