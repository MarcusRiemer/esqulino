import { Component } from '@angular/core';
import { map } from 'rxjs/operators';

import { UserService } from './user.service';
import { ChangePasswordDescription } from './auth-description';
@Component({
  selector: "change-password",
  templateUrl: "./templates/change-password.html"
})
export class ChangePasswordComponent {
  constructor(
    private _userService: UserService
  ) { }

  public confirmedPassword: string;
  public newPasswordData: ChangePasswordDescription = {
    currentPassword: undefined,
    newPassword: undefined
  };

  public hasPasswordIdentity = this._userService.providers$.pipe(
    map(a => a.some(v => v.type === "PasswordIdentity" && v.confirmed))
  )

  public isPasswordEqual(): boolean {
    return this.confirmedPassword === this.newPasswordData.newPassword;
  }

  public onChangePassword(): void {
    if (this.isPasswordEqual()) {
      this._userService
        .changePassword$(this.newPasswordData)
        .subscribe()
    } else {
      alert("Die eigegebenen Passwörter sind nicht gleich.")
    }
  }
}