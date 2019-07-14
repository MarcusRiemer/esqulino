import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';

@Component({
  templateUrl: './templates/auth-dialog.html'
})
export class AuthDialogComponent {

  constructor( ) { }

  public signInOrUp: boolean = true;

  public changeContent(): void {
    this.signInOrUp = false;
  }

  public changeToSignInOrSignUp(): void {
    this.signInOrUp = true;
  }

  public static showDialog(dialog: MatDialog) {
    dialog.open(AuthDialogComponent, {
      height: '600px'
    });
  }
}