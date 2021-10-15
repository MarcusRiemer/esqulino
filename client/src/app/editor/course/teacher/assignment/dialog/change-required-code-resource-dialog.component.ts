import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { first } from "rxjs/operators";
import { UpdateAssignmentRequiredCodeResourceGQL } from "../../../../../../generated/graphql";

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
    public dialogRef: MatDialogRef<ChangeRequiredCodeResourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: changedRequiredCodeResourceDialogInput,
    private readonly _mutUpdateRequiredCodeResource: UpdateAssignmentRequiredCodeResourceGQL,
    private readonly _formBuilder: FormBuilder
  ) {}

  changeAssignmentDescriptionForm: FormGroup = this._formBuilder.group({
    requirementDescription: [],
  });

  async saveUpdate() {
    await this._mutUpdateRequiredCodeResource
      .mutate({
        id: this.data.requirementId,
        description: this.changeAssignmentDescriptionForm.get(
          "requirementDescription"
        ).value,
      })
      .pipe(first())
      .toPromise()
      .then((e) => {
        this.dialogRef.close();
      });
  }

  ngOnInit(): void {
    this.changeAssignmentDescriptionForm.patchValue(this.data);
  }
}
