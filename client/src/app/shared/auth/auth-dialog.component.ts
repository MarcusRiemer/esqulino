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

  private _message: string;
  private _type: string;
  private _secondContent: boolean = false;
  private _emailContent: boolean = false;

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

  public get secondContent(): boolean {
    return this._secondContent;
  }

  public get emailContent(): boolean {
    return this._emailContent;
  }

  public set emailContent(status: boolean) {
    this._emailContent = status;
  }

  ngOnInit(): void {
    if (this.data) {
      console.log(`AuthDialog-Data: ${JSON.stringify(this.data)}`)
      this.message = this.data.message;
      this.type = this.data.message_type || 'error';
    }
  }

  public showEmailContent(): void {
    this.emailContent = true;
  }

  public static showDialog(dialog: MatDialog, data: AuthDialogDataDescription) {
    dialog.open(AuthDialogComponent, { data: data });
  }

  public isSignIn(): boolean {
    return this.data.type === "signIn";
  }

  /**
   * This function switches between the second
   * content and the sign in / up.
   * For example, the second content is password reset
   */
  public changeContent(): void {
    this._secondContent = !this.secondContent;
  }
}
