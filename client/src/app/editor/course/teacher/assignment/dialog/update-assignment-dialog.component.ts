import { formatDate } from "@angular/common";
import { Component, Inject, LOCALE_ID, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { first } from "rxjs/operators";
import { UpdateAssignmentGQL } from "../../../../../../generated/graphql";

interface UpdateAssignmentInput {
  id: string;
  startDate: string;
  endDate: string;
  weight: number;
  name: string;
}

@Component({
  templateUrl: "update-assignment-dialog.component.html",
})
export class UpdateAssignmentDialogComponent implements OnInit {
  updateAssignmentForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<UpdateAssignmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: UpdateAssignmentInput,
    private readonly _mutUpdateAssignment: UpdateAssignmentGQL,
    private readonly _fromBuilder: FormBuilder,
    @Inject(LOCALE_ID) private _locale: string
  ) {}

  ngOnInit(): void {
    this.updateAssignmentForm = this._fromBuilder.group({
      updateStartDate: [
        this.data.startDate
          ? formatDate(this.data.startDate, "yyyy-MM-dd", this._locale)
          : undefined,
      ],
      updateStartTime: [
        this.data.startDate
          ? formatDate(this.data.startDate, "hh:mm", this._locale)
          : undefined,
      ],
      updateEndDate: [
        this.data.endDate
          ? formatDate(this.data.endDate, "yyyy-MM-dd", this._locale)
          : undefined,
      ],
      updateEndTime: [
        this.data.endDate
          ? formatDate(this.data.endDate, "hh:mm", this._locale)
          : undefined,
      ],
      updateWeight: [this.data.weight],
    });
  }

  async onUpdateAssignment() {
    const tempStartDate = this.mergeDateAndTime(
      this.updateAssignmentForm.controls["updateStartDate"].value,
      this.updateAssignmentForm.controls["updateStartTime"].value
    );

    const tempEndDate = this.mergeDateAndTime(
      this.updateAssignmentForm.controls["updateEndDate"].value,
      this.updateAssignmentForm.controls["updateEndTime"].value
    );

    await this._mutUpdateAssignment
      .mutate({
        id: this.data.id,
        startDate: tempStartDate,
        endDate: tempEndDate,
        weight: this.updateAssignmentForm.controls["updateWeight"].value,
      })
      .pipe(first())
      .toPromise()
      .then((e) => this.dialogRef.close());
  }

  //TODO: refactore and merge with the function in the create assingment
  mergeDateAndTime(date: string, time: string): string {
    let toReturn: Date = date ? new Date(date) : undefined;
    if (!!date) {
      if (!!time) {
        let temp = time.split(":");
        toReturn.setHours(+temp[0], +temp[1]);
      } else {
        toReturn.setHours(0, 0);
      }
    }
    return toReturn?.toISOString();
  }
}
