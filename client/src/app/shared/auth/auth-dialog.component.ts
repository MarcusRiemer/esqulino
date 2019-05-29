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

  public register: boolean = false;
  public readonly providers = providers

  private registerUserWithPassword(): void {
    this._userService.signIn(this.general.value).subscribe(
      data => console.log(JSON.stringify(data))
    )
  }

  private loginUserWithPassword(): void {
    
  }

  public general = new FormGroup({
    email: new FormControl('', [
      Validators.email, Validators.required
    ]),
    password: new FormControl('', [
      Validators.minLength(6), Validators.required
    ])
  })

  public onClose(): void {
    this._dialogRef.close();
  }


  public onSubmit(): void {
    if (this.general.valid) {
      if (this.register) {
        this.registerUserWithPassword()
      } else {
        this.loginUserWithPassword()
      }
    } else {
      // TODO ERROR MESSAGE
    }
  }

  public onChange(): void {
    this.register = !this.register;
  }

  public onSignIn(provider: string) {
    window.location.href = this._serverApi.getSignInUrl(provider);
  }

  public static showDialog(dialog: MatDialog) {
    dialog.open(AuthDialogComponent, {
      width: '700px',
      height: '340px'
    });
  }
}