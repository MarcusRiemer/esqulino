import { Component } from "@angular/core";

import { UserEmailDescription } from "./user.description";
import { UserService } from "./user.service";
@Component({
  selector: "request-reset-password",
  templateUrl: "./templates/request-reset-password.html",
})
export class RequestResetPasswordComponent {
  constructor(private _userService: UserService) {}

  /**
   * Die Innformation der E-mail wird benötigt um den password reset zu ermgölichen.
   * Die Daten werden mittels HTTP Anfrage an den Server gesendet.
   */
  public userEmail: UserEmailDescription = {
    email: undefined,
  };

  /**
   * Triggers a request for a password reset
   */
  public onPasswordResetRequest(): void {
    this._userService.passwordResetRequest$(this.userEmail).subscribe();
  }
}
