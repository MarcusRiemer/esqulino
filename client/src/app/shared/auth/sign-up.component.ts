import { Component, Output, EventEmitter } from "@angular/core";

import { first } from "rxjs/operators";

import { UserService } from "./user.service";
import { SignUpDescription } from "./auth-description";
@Component({
  selector: "sign-up",
  templateUrl: "./templates/sign-up.html",
})
export class SignUpComponent {
  // Is responsible for displaying the secondary content
  @Output() content = new EventEmitter();

  constructor(private _userService: UserService) {}

  /**
   * "confirmed password" is used to indicate,
   * if the password was typed in correctly or not.
   * If the password was typed in incorrectly,
   * the user has to type the password in correctly.
   */
  public confirmedPassword: string;

  /**
   * The data is used for a sign up via http request
   */
  public signUpData: SignUpDescription = {
    email: undefined,
    username: undefined,
    password: undefined,
  };

  /**
   * Were both passwords typed in correctly?
   */
  public isPasswordEq(): boolean {
    return this.signUpData.password === this.confirmedPassword;
  }

  /**
   * Was a password typed in?
   */
  public isPasswordEmpty(): boolean {
    return this.signUpData.password === undefined;
  }

  /**
   * triggers the transition from “sign up” to “sent a new verification email”
   */
  public onSendVerifyLink(): void {
    this.content.emit();
  }

  /**
   * Tiggers a sign up via http request
   */
  public onSignUp(): void {
    if (this.isPasswordEq()) {
      if (!this.isPasswordEmpty()) {
        this._userService.signUp$(this.signUpData).pipe(first()).subscribe();
      } else alert("Error: Password can not be empty");
    } else alert("Error: Your passwords do not match");
  }
}
