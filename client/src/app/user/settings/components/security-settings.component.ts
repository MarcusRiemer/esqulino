import { MatDialog } from '@angular/material';
import { Component } from '@angular/core';

import { ChangePasswordComponent } from 'src/app/shared/auth/change-password.component';


@Component({
  templateUrl: '../templates/security-settings.html'
})
export class SecuritySettingsComponent {
  constructor(private _dialog: MatDialog) {}

  public onChangePassword(): void {
    ChangePasswordComponent.showDialog(this._dialog)
  }
}