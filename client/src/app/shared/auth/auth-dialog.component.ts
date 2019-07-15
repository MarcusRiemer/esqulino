import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material";

import { AuthDialogDataDescription } from "./auth-description";

@Component({
  templateUrl: "./templates/auth-dialog.html"
})
export class AuthDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: AuthDialogDataDescription
  ) { }

  public signInOrUp: boolean = true;

  private _message: string;
  private _type: string;

  public get message(): string {
    return this._message;
  }

  public set message(msg: string) {
    this._message = msg;
  }

  public get type(): string {
    return this._type;
  }

  public set type(type: string) {
    this._type = type;
  }

  ngOnInit(): void {
    if (this.data) {
      console.log(`AuthDialog-Data: ${JSON.stringify(this.data)}`)
      this.message = this.data.message;
      this.type = this.data.type || 'error';
    }
  }

  public changeContent(): void {
    this.signInOrUp = false;
  }

  public changeToSignInOrSignUp(): void {
    this.signInOrUp = true;
  }

  public static showDialog(dialog: MatDialog) {
    dialog.open(AuthDialogComponent);
  }
}
