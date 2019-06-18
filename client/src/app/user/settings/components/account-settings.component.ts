import { UserDescription, UserEmailDescription } from './../../../shared/auth/user.description';
import { ChangePrimaryEmailDescription } from './../../../shared/auth/provider.description';
import { Component } from '@angular/core';

import { UserService } from '../../../shared/auth/user.service';
import { ProviderDescription } from '../../../shared/auth/provider.description';
import { ServerDataService } from '../../../shared';
@Component({
  templateUrl: '../templates/account-settings.html'
})
export class AccountSettingsComponent {
  constructor(
    private _userService: UserService,
  ) {}

  public editedUsername: string;
  public username$ = this._userService.userDisplayName$;
}