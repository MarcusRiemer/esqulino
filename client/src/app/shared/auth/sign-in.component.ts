import { MatSnackBar } from '@angular/material';
import { Component, Output, EventEmitter } from "@angular/core";

import { SignInDescription } from './auth-description';
import { UserService } from './user.service';
import { Roles } from '../authorisation/roles.enum';
@Component({
  selector: 'sign-in',
  templateUrl: './templates/sign-in.html'
})
export class SignInComponent {
  @Output() content = new EventEmitter()

  public signInData: SignInDescription = {
    email: undefined,
    password: undefined
  }

  constructor(
    private _userService: UserService,
    private _snackBar: MatSnackBar
  ) { }

  public onResetPassword(): void {
    this.content.emit();
  }

  public onSignIn(): void {
    this._userService
      .signIn$(this.signInData)
      .subscribe(
        user => {
          if (!user.roles.includes(Roles.Guest)) {
            this._snackBar.open('Succesfully logged in', '', { duration: 2000 })
          }
        },
      )
  }
}