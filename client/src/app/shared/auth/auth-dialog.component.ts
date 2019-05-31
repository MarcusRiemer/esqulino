import { AuthContentDescription } from './auth-dialog-content.description';
import { Component } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { Validators, FormControl, FormGroup } from '@angular/forms';

import { ServerApiService } from '../serverdata/serverapi.service';
import { UserService } from './user.service';
import { providers } from './providers';

@Component({
  templateUrl: './templates/auth-dialog.html'
})
export class AuthDialogComponent {
  constructor(
    private _dialogRef: MatDialogRef<AuthDialogComponent>,
    private _serverApi: ServerApiService,
    private _snackBar: MatSnackBar,
    private _userService: UserService
  ) {}

  public displayingContent: AuthContentDescription = "SignIn";
  public readonly providers = providers

  // private registerUserWithPassword(): void {
  //   this._userService.signIn(this.general.value).subscribe(
  //     data => console.log(JSON.stringify(data))
  //   )
  // }

  private loginUserWithPassword(): void {
    
  }

  public changeContent(content: AuthContentDescription): void {
    this.displayingContent = content;
  }

  public onClose(): void {
    this._dialogRef.close();
  }


  // public onSubmit(): void {
  //   if (this.general.valid) {
  //     if (this.register) {
  //       this.registerUserWithPassword()
  //     } else {
  //       this.loginUserWithPassword()
  //     }
  //   } else {
  //     // TODO ERROR MESSAGE
  //   }
  // }

  public shouldDisplayResetPassword(): boolean {
    return this.displayingContent === 'ResetPassword';
  }

  public shouldDisplaySignIn(): boolean {
    return this.displayingContent === 'SignIn';
  }

  public shouldDisplaySignOut(): boolean {
    return this.displayingContent === 'SignOut';
  }

  public shouldDisplayVerifyEmail(): boolean {
    return this.displayingContent === 'VerifyEmail';
  }


  public static showDialog(dialog: MatDialog) {
    dialog.open(AuthDialogComponent, {
      height: '500px'
    });
  }
}