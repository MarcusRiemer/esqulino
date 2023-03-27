import { Component, Inject, OnInit } from "@angular/core";
import { MatLegacyDialog as MatDialog, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog";

import { AuthDialogDataDescription } from "./auth-description";

@Component({
  templateUrl: "./templates/auth-dialog.html",
})
export class AuthDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    private readonly _data: AuthDialogDataDescription
  ) {}

  readonly message = this._data?.message;

  readonly messageType = this._data?.message_type;

  readonly dialogType = this._data?.type ?? "error";

  readonly hasMessage = !!this.message;

  ngOnInit(): void {
    if (!this._data) {
      throw new Error("Created auth dialogue without data instructions");
    }
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
}
