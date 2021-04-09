import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";

import { first } from "rxjs/operators";

import { AffectedResource } from "../../generated/graphql";

export interface AffectedResourcesDialogData {
  affected: AffectedResource[];
  header: string;
}

export const MSG_STORED_SEEDS = $localize`:@@message.stored-seeds:Die folgenden Daten wurden im Seed abgelegt:`;

@Component({
  selector: "app-affected-resources-dialog",
  templateUrl: "./affected-resources-dialog.component.html",
})
export class AffectedResourcesDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    readonly data: AffectedResourcesDialogData
  ) {}

  ngOnInit(): void {}

  static show(
    matDialog: MatDialog,
    affected: AffectedResource[],
    header: string
  ) {
    const p = matDialog
      .open(AffectedResourcesDialogComponent, {
        data: { affected, header },
      })
      .afterClosed()
      .pipe(first())
      .toPromise();

    return p;
  }
}
