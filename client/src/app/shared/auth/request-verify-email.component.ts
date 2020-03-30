import { Component } from "@angular/core";

import { UserEmailDescription } from "./user.description";
import { UserService } from "./user.service";
@Component({
  selector: "request-verify-email",
  templateUrl: "./templates/request-verify-email.html",
})
export class RequestVerifyEmailComponent {
  constructor(private _userService: UserService) {}

  /**
   * The e-mail information is required to reset the password
   */
  public userEmail: UserEmailDescription = {
    email: undefined,
  };

  /**
   * If the User didn’t get a verification email,
   * the user can request a new verification email via http request
   */
  public onSendVerifyEmail(): void {
    this._userService.sendVerifyEmail$(this.userEmail).subscribe();
  }
}
