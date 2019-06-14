import { UserService } from './user.service';
import { SignUpDescription } from './auth-description';
import { Component } from '@angular/core';


@Component({
  selector: 'sign-up',
  templateUrl: './templates/sign-up.html'
})
export class SignUpComponent {
  constructor(
    private _userService: UserService
  ) {}

  public signUpData: SignUpDescription = {
    email: undefined,
    username: undefined,
    password: undefined,
  };

  public confirmedPassword: string;

  public isPasswordEq(): boolean {
    return this.signUpData.password === this.confirmedPassword;
  }

  public onSendVerifyLink(): void {

  }

  public onSignUp(): void {
    if (this.isPasswordEq()) {
      this._userService.signUp$(this.signUpData).subscribe(
        _ => alert("Please confirm your e-mail"),
       
      )
    }
  }
}
