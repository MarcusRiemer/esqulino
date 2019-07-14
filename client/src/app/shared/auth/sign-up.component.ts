import { Component, Output, EventEmitter } from "@angular/core";

import { UserService } from "./user.service";
import { SignUpDescription } from "./auth-description";

@Component({
  selector: "sign-up",
  templateUrl: "./templates/sign-up.html"
})
export class SignUpComponent {
  @Output() content = new EventEmitter();

  constructor(private _userService: UserService) { }

  public signUpData: SignUpDescription = {
    email: undefined,
    username: undefined,
    password: undefined
  };

  public confirmedPassword: string;

  public isPasswordEq(): boolean {
    return this.signUpData.password === this.confirmedPassword;
  }

  public isPasswordEmpty(): boolean {
    return this.signUpData.password === undefined;
  }

  public onSendVerifyLink(): void {
    this.content.emit();
  }

  public onSignUp(): void {
    if (this.isPasswordEq()) {
      if (!this.isPasswordEmpty()) {
        this._userService.signUp$(this.signUpData).subscribe();
      } else { alert("Error: Password can not be empty") }
    } else {
      alert("Error: Your passwords do not match");
    }
  }
}
