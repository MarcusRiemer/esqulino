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
    retypedPassword: undefined,
  };

  public onSendVerifyLink(): void {

  }

  public onSignUp(): void {
    this._userService.onSignUp(this.signUpData).subscribe(
      data => console.log(JSON.stringify(data))
    )
  }
}
