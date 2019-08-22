import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { UserService } from '../../../shared/auth/user.service';
import { providers } from '../../../shared/auth/providers';
import { ServerProviderDescription } from '../../../shared/auth/provider.description';
import { AddEmailDialogComponent } from './add-email-dialog.component';
@Component({
  templateUrl: '../templates/account-settings.html'
})
export class AccountSettingsComponent implements OnInit {
  constructor(
    private _userService: UserService,
    private _dialog: MatDialog
  ) { }

  public providers = providers;
  public identities: ServerProviderDescription;

  public ngOnInit(): void {
    this._userService.identities$.value
      .subscribe(
        identities => this.identities = identities
      )
  }

  public onTrigger(): void {
    // If there exists no identity with password, ask for password
    this._dialog.open(AddEmailDialogComponent, {
      minWidth: '20em',
      data: this.identities
    });
  }
}