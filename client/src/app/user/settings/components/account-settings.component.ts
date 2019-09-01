import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';

import { UserService } from '../../../shared/auth/user.service';
import { ServerProviderDescription } from '../../../shared/auth/provider.description';
import { AddEmailDialogComponent } from './add-email-dialog.component';
@Component({
  templateUrl: './templates/account-settings.html'
})
export class AccountSettingsComponent {
  constructor(
    private _userService: UserService,
    private _dialog: MatDialog
  ) { }

  // Linked identities
  public identities$ = this._userService.identities$;

  public onTrigger(identities: ServerProviderDescription): void {
    // If there exists no identity with password, ask for password
    this._dialog.open(AddEmailDialogComponent, {
      minWidth: '20em',
      data: identities
    });
  }
}