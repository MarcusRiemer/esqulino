import { Component, Inject, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { first, map } from "rxjs/operators";
import {
  CreateAssignmentSubmittedCodeResourceGQL,
  ReferenceTypeEnum,
} from "../../../../../../generated/graphql";

import { CourseService } from "../../../course.service";

interface requirementSolutionDialogInput {
  groupId: string;
  requiredId: string;
  programmingLanguageId: string;
  referenceType: ReferenceTypeEnum;
}

@Component({
  selector: "app-create-required-code-resource-solution",
  templateUrl:
    "./create-assignment-submitteed-code-resource-dialog.component.html",
})
export class CreateAssignmentSubmittedCodeResourceDialogComponent
  implements OnInit
{
  constructor(
    private readonly _courseService: CourseService,
    public dialogRef: MatDialogRef<CreateAssignmentSubmittedCodeResourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: requirementSolutionDialogInput,
    private readonly _mutCreateAssignmentSubmittedCodeResource: CreateAssignmentSubmittedCodeResourceGQL,
    private readonly _fromBuilder: FormBuilder
  ) {}

  availableBlockLanguages$ = this._courseService.fullCourseData$.pipe(
    map((course) => course.basedOnProject.blockLanguages)
  );

  createSubmittedResourceForm: FormGroup = this._fromBuilder.group({
    solutionBlockLanguageId: ["undefined"],
  });

  ngOnInit(): void {
    console.log(this.data.programmingLanguageId);
    this.availableBlockLanguages$ = this._courseService.fullCourseData$.pipe(
      map((course) =>
        course.basedOnProject.blockLanguages.filter(
          (blockLanguage) =>
            blockLanguage.defaultProgrammingLanguageId ==
            this.data.programmingLanguageId
        )
      )
    );
  }

  async saveSolution() {
    await this._mutCreateAssignmentSubmittedCodeResource
      .mutate({
        groupId: this.data.groupId,
        requiredCodeResourceId: this.data.requiredId,
        blockLanguageId: this.createSubmittedResourceForm.get(
          "solutionBlockLanguageId"
        ).value,
      })
      .pipe(first())
      .toPromise()
      .then((e) => {
        this.dialogRef.close();
      });
  }
}
