import { Component } from "@angular/core";

import { UserService } from "../../../shared/auth/user.service";

@Component({
  templateUrl: "./templates/account-settings.html",
})
export class AccountSettingsComponent {
  constructor(private _userService: UserService) {}

  // Linked identities
  public identities = this._userService.identities;
}
