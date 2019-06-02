import { Component } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';

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

  public readonly providers = providers

  public primaryContent:boolean = true;

  private loginUserWithPassword(): void {
    
  }

  public changeContent(): void {
    this.primaryContent = false;
  }

  public onClose(): void {
    this._dialogRef.close();
  }

  public changeToPrimaryContent(): void {
    this.primaryContent = true;
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

  public static showDialog(dialog: MatDialog) {
    dialog.open(AuthDialogComponent, {
      height: '500px'
    });
  }
}