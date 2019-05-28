import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Component } from '@angular/core';

import { AuthDialogComponent } from './auth-dialog.component';
import { UserService } from './user.service';


@Component({
  selector: 'user-button',
  templateUrl: './templates/user-button.html'
})
export class UserButtonComponent{
  constructor(
    private _dialog: MatDialog,
    private _userService: UserService,
    private _router: Router
  ) {}

  public openDialog(): void {
    AuthDialogComponent.showDialog(this._dialog)
  }

  public onLogout(): void {
   this._userService.onLogout().subscribe(
     _ => this._router.navigate(['/']),
     err => alert(JSON.stringify(err))
   )
  }
}