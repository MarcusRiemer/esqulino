import { Component, OnInit } from "@angular/core";

import { UserService } from './user.service';
@Component({
  selector: "providers-all-buttons",
  templateUrl: "./templates/providers-all-buttons.html"
})
export class ProvidersAllButtonsComponent {
  constructor(
    private _userService: UserService
  ) { }

  readonly providers$ = this._userService.providerList$
}
