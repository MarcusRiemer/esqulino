import { Component } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';

import { providers } from './providers';

@Component({
  templateUrl: './templates/auth-dialog.html'
})
export class AuthDialogComponent {

  constructor(
    private _dialogRef: MatDialogRef<AuthDialogComponent>,
  ) {}

  public readonly providers = providers

  public primaryContent:boolean = true;

  public changeContent(): void {
    this.primaryContent = false;
  }


  public onClose(): void {
    this._dialogRef.close();
  }

  public changeToPrimaryContent(): void {
    this.primaryContent = true;
  }

  public static showDialog(dialog: MatDialog) {
    dialog.open(AuthDialogComponent, {
      height: '600px'
    });
  }
  
}