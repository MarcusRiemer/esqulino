import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Component } from '@angular/core';

import { AuthDialogComponent } from './auth-dialog.component';
import { UserService } from './user.service';


@Component({
  selector: 'user-button',
  templateUrl: './templates/user-button.html'
})
export class UserButtonComponent {
  constructor(
    private _dialog: MatDialog,
    private _userService: UserService,
    private _router: Router
  ) { }

  readonly userDisplayName$ = this._userService.userDisplayName$

  /**
   * Opens an dialog for sign in or sign up
   */
  public openDialog(): void {
    AuthDialogComponent.showDialog(this._dialog)
    // If youre on the base url and your loggin in, the dialog will be closed
    this._userService.isLoggedIn$.subscribe(
      loggedIn => {
        if (loggedIn) {
          this._dialog.closeAll()
        }
      }
    )
  }

  /**
   * Sends an delete request and navigates back to the base url
   */
  public onLogout(): void {
    this._userService.logout$().subscribe(
      _ => {
        this._router.navigate(['/']);
      }
    )
  }
}