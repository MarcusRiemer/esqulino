import { Component } from '@angular/core';

import { UserService } from '../../../shared/auth/user.service';
import { providers } from '../../../shared/auth/providers';
import {  UserNameDescription } from './../../../shared/auth/user.description';

@Component({
  templateUrl: '../templates/account-settings.html'
})
export class AccountSettingsComponent {
  constructor(
    private _userService: UserService,
  ) {}

  public userNameData: UserNameDescription = {
    displayName: undefined,
  };

  public username$ = this._userService.userDisplayName$;
  public providers = providers;
  public linkedProviders$ = this._userService.linkedProviders$;

  public onChangeUserName(): void {
    this.linkedProviders$.subscribe(data => console.log(data))
    if (this.userNameData.displayName) {
      this._userService.changeUserName$(this.userNameData)
        .subscribe()
    }
  }
}