import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../../../shared/auth/user.service';

@Component({
  templateUrl: '../templates/account-settings.html'
})
export class AccountSettingsComponent {
  constructor(
    private _userService: UserService
  ) {}

  public editedUsername: string;

  public username$: Observable<string> = this._userService.userDisplayName$;
}