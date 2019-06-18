import { Component } from '@angular/core';

import { UserService } from './user.service';
import { ChangePasswordDescription } from './auth-description';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: "change-password",
  templateUrl: "./templates/change-password.html"
})
export class ChangePasswordComponent {
  constructor(
    private _userService: UserService
  ) {}

  public newPasswordData: ChangePasswordDescription = { 
    currentPassword: undefined,
    newPassword: undefined
  };

  public confirmedPassword: string;

  public onChangePassword(): void {
    if (this.confirmedPassword === this.newPasswordData.newPassword) {
      this._userService
        .changePassword$(this.newPasswordData)
        .subscribe()
    } else {
      alert("Die eigegebenen Passwörter sind nicht gleich.")
    }
  }
}