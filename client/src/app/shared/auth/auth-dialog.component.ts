import { Component } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { Validators, FormControl, FormGroup } from '@angular/forms';

@Component({
  templateUrl: './templates/auth-dialog.html'
})
export class AuthDialogComponent {
  constructor(
    private _dialogRef: MatDialogRef<AuthDialogComponent>
  ) {}

  public register: boolean = false;

  public readonly general = new FormGroup({
    email: new FormControl('', [
      Validators.email, Validators.required
    ]),
    password: new FormControl('', [
      Validators.minLength(6), Validators.required
    ])
  })

  public onNoClick(): void {
    this._dialogRef.close();
  }

  public onChange(): void {
    this.register = true;
  }

  public static show(dialog: MatDialog) {
    dialog.open(AuthDialogComponent, {
      width: '500px'
    });
  }
}