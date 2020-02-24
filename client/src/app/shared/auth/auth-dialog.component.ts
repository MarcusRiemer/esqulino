import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";

import { AuthDialogDataDescription } from "./auth-description";

@Component({
  templateUrl: "./templates/auth-dialog.html"
})
export class AuthDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: AuthDialogDataDescription
  ) { }

  /**
   *  Message to display
   */
  private _message: string;

  /**
   * Type of message 
   */
  private _type: string;

  /**
   * Is the second content displayed? 
   */
  private _secondContent: boolean = false;

  /**
   * Does the user want to see the sign in/up with a password?
   */ 
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
      // Message to display
      this.message = this.data.message;
      // Which css class should be used
      this.type = this.data.message_type || 'error';
    } else {
      console.error("Please pass a data object");
    }
  }

  /**
   * Either the sign in or sign up are hidden 
   * and will be displayed on clicking the e-mail button.
   * The clicked e-mail button triggers the showEmailContent function.
   */
  public showEmailContent(): void {
    this.emailContent = true;
  }

  /**
   * Static method for opening this component as dialog.
   * AuthDialogComponent.
   * @param dialog Service to open Material Design modal dialogs.
   * @param data Passing data to dialog
   */
  public static showDialog(dialog: MatDialog, data: AuthDialogDataDescription) {
    dialog.open(AuthDialogComponent, { data: data });
  }

  /**
   * Is signIn dialog opend?
   * type: signIn | signUp
   */
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
