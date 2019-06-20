import { Component } from '@angular/core';

import { UserService } from '../../../shared/auth/user.service';
import { providers } from '../../../shared/auth/providers';

@Component({
  templateUrl: '../templates/account-settings.html'
})
export class AccountSettingsComponent {
  constructor(
    private _userService: UserService,
  ) {
  }

  public editedUsername: string;
  public username$ = this._userService.userDisplayName$;
  public providers = providers;
  public identities$ = this._userService.externIdentities$;
}