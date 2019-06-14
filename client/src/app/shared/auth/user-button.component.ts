import { Router } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Component } from '@angular/core';

import { AuthDialogComponent } from './auth-dialog.component';
import { UserService } from './user.service';
import { LinkIdentityComponent } from './link-identity.component';
import { ChangePasswordComponent } from './change-password.component';


@Component({
  selector: 'user-button',
  templateUrl: './templates/user-button.html'
})
export class UserButtonComponent{
  constructor(
    private _dialog: MatDialog,
    private _userService: UserService,
    private _router: Router,
    private _snackBar: MatSnackBar
  ) {}

  readonly userDisplayName = this._userService.userDisplayName$

  public openDialog(): void {
    AuthDialogComponent.showDialog(this._dialog)
  }

  public onLinkAccount(): void {
    LinkIdentityComponent.showDialog(this._dialog)
  }

  public onChangeEmail(): void {

  }



  public onLogout(): void {
   this._userService.logout$().subscribe(
     _ => {
       this._router.navigate(['/']);
     }
   )
  }
}