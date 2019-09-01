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

  /**
   * The confirmation of the new password
   */
  public confirmedPassword: string;

  /**
   * This data will be sent to the server
   */
  public newPasswordData: ChangePasswordDescription = {
    currentPassword: undefined,
    newPassword: undefined
  };

  /**
   * Checks if the current user has an PasswordIdentity which is confirmed
   * Is the condition for displaying change-password.html
   */
  public hasPasswordIdentity = this._userService.providers$.pipe(
    map(a => a.some(v => v.type === "PasswordIdentity" && v.confirmed))
  )

  /**
   * The verification of an identically specified password
   * takes place exclusively on the client side.
   * This is because user registrations should be done through the site of Blattwerkzeug.
   */
  public isPasswordEqual(): boolean {
    return this.confirmedPassword === this.newPasswordData.newPassword;
  }

  /**
   * If the password was entered twice identically,
   * send an HTTP request to the server
   */
  public onChangePassword(): void {
    if (this.isPasswordEqual()) {
      this._userService
        .changePassword$(this.newPasswordData)
        .subscribe()
    } else alert("Die eigegebenen Passwörter sind nicht identisch.")
  }
}