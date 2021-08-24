import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { first } from "rxjs/operators";
import { UpdateAssignmentRequiredCodeResourceGQL } from "src/generated/graphql";
import { CourseService } from "../../../course.service";

interface changedRequiredCodeResourceDialogInput {
  requirementId: string;
  requirementName: string;
  requirementDescription: string;
}

@Component({
  templateUrl: "change-required-code-resource-dialog.component.html",
})
export class ChangeRequiredCodeResourceDialogComponent implements OnInit {
  constructor(
    private readonly _courseService: CourseService,
    public dialogRef: MatDialogRef<ChangeRequiredCodeResourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: changedRequiredCodeResourceDialogInput,
    private readonly _mutUpdateRequiredCodeResource: UpdateAssignmentRequiredCodeResourceGQL
  ) {}

  async saveUpdate() {
    await this._mutUpdateRequiredCodeResource
      .mutate({
        id: this.data.requirementId,
        description: this.data.requirementDescription,
      })
      .pipe(first())
      .toPromise()
      .then((e) => {
        this.dialogRef.close();
      });
  }

  ngOnInit(): void {}
}
