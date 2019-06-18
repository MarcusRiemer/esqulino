import { UserService } from './user.service';
import { Component } from '@angular/core';
import {  MatDialog } from '@angular/material';

import { providers } from './providers';

@Component({
  templateUrl: './templates/auth-dialog.html'
})
export class AuthDialogComponent {

  constructor(
    private _userService: UserService
  ) { }

  public readonly providers = providers

  public primaryContent:boolean = true;

  public changeContent(): void {
    this.primaryContent = false;
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