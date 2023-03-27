import { Component, Inject } from "@angular/core";
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialog as MatDialog,
} from "@angular/material/legacy-dialog";
import { first } from "rxjs/operators";

import { MessageDialogDescription } from "./message-dialog.description";

interface MessageDialogOptions {
  messages: MessageDialogDescription;
  type: "alert" | "confirm";
}

/**
 * Shows a general purpose Dialogue
 */
@Component({
  templateUrl: "./templates/message-dialog.html",
})
export class MessageDialogComponent {
  constructor(
    readonly _dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    private readonly _data: MessageDialogOptions
  ) {}

  readonly data = this._data.messages;

  readonly dialogueType = this._data.type;

  onClose(result?: boolean): void {
    this._dialogRef.close(result);
  }

  static alert(matDialog: MatDialog, messages: MessageDialogDescription) {
    const p = matDialog
      .open(MessageDialogComponent, { data: { messages, type: "alert" } })
      .afterClosed()
      .pipe(first())
      .toPromise();

    return p;
  }

  static confirm(matDialog: MatDialog, messages: MessageDialogDescription) {
    const p = matDialog
      .open(MessageDialogComponent, {
        disableClose: true,
        data: { messages, type: "confirm" },
      })
      .afterClosed()
      .pipe(first())
      .toPromise();

    return p;
  }
}
