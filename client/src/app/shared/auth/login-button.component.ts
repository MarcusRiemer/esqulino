import { Component } from '@angular/core';

import { AuthDialogComponent } from './auth-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'authentication-button',
  templateUrl: './templates/login-button.html'
})
export class LoginButtonComponent{
  constructor(
    private _dialog: MatDialog
  ) {}

  public openDialog(): void {
    AuthDialogComponent.show(this._dialog)
  }
}