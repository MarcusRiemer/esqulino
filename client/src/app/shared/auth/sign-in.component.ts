import { MatSnackBar } from "@angular/material/snack-bar";
import { Component, Output, EventEmitter } from "@angular/core";

import { SignInDescription } from "./auth-description";
import { UserService } from "./user.service";
import { Roles } from "../authorisation/roles.enum";
@Component({
  selector: "sign-in",
  templateUrl: "./templates/sign-in.html",
})
export class SignInComponent {
  // Is responsible for showing the secondary content
  @Output() content = new EventEmitter();

  constructor(
    private _userService: UserService,
    private _snackBar: MatSnackBar
  ) {}

  /**
   * E-mail and password are required for sign-in
   */
  public signInData: SignInDescription = {
    email: undefined,
    password: undefined,
  };

  /**
   * Triggers the transition from “sign in” to “reset password”
   */
  public onResetPassword(): void {
    this.content.emit();
  }

  /**
   * Triggert eine HTTP Anfrage für ein sign-in
   */
  public onSignIn(): void {
    this._userService.signIn$(this.signInData).subscribe();
  }
}
