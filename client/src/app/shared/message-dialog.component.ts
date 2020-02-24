import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MessageDialogDescription } from './message-dialog.description';
@Component({
  templateUrl: "./templates/message-dialog.html"
})
export class MessageDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MessageDialogDescription
  ) { }

  onClose(): void {
    this.dialogRef.close();
  }
}