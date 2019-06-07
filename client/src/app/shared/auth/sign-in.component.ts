import { UserService } from './user.service';
import { Component, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SignInDescription } from './auth-description';
import { MatSnackBar } from '@angular/material';

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
  ) {}

  public onResetPassword(): void {
    this.content.emit();
  }

  public onSignIn(): void {
    this._userService.onSignIn$(this.signInData).subscribe(
      (user) => {
        if (user.loggedIn) {
          this._snackBar.open('Succesfully logged in', '', { duration: 2000 })
        }
      },
      (err) => alert(`Error: ${JSON.stringify(err["error"]["error"])}`)
    )
  }
}