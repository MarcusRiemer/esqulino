import { Component } from "@angular/core";
import { MatDialog, MatDialogRef } from '@angular/material';


@Component({
  selector: "link-identity",
  templateUrl: "./templates/link-identity.html"
})
export class LinkIdentityComponent {
  constructor(
    private _dialogRef: MatDialogRef<LinkIdentityComponent>
  ) {}


  public static showDialog(dialog: MatDialog) {
    dialog.open(LinkIdentityComponent, {
      height: '550px'
    });
  }
}