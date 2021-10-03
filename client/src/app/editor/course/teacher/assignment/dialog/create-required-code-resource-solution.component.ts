import { WHITE_ON_BLACK_CSS_CLASS } from "@angular/cdk/a11y/high-contrast-mode/high-contrast-mode-detector";
import { Time } from "@angular/common";
import { Component, Inject, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { find, first, map } from "rxjs/operators";
import { PerformDataService } from "src/app/shared/authorisation/perform-data.service";
import {
  CreateAssignmentRequiredSolutionFromGQL,
  CreateAssignmentRequiredSolutionGQL,
} from "src/generated/graphql";
import { CourseService } from "../../../course.service";

interface requirementSolutionDialogInput {
  requiredId: string;
  programmingLanguageId: string;
}

@Component({
  selector: "app-create-required-code-resource-solution",
  templateUrl: "./create-required-code-resource-solution.component.html",
})
export class CreateRequiredCodeResourceSolutionComponent implements OnInit {
  constructor(
    private readonly _courseService: CourseService,
    public dialogRef: MatDialogRef<CreateRequiredCodeResourceSolutionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: requirementSolutionDialogInput,
    private readonly _mutCreateSolution: CreateAssignmentRequiredSolutionGQL,
    private readonly _mutCreateSolutionFrom: CreateAssignmentRequiredSolutionFromGQL,
    private readonly _formBuilder: FormBuilder
  ) {}

  availableBlockLanguages$ = this._courseService.fullCourseData$.pipe(
    map((course) =>
      course.blockLanguages.filter(
        (blockLanguage) =>
          blockLanguage.defaultProgrammingLanguageId ==
          this.data.programmingLanguageId
      )
    )
  );

  availableCodeResources$ = this._courseService.fullCourseData$.pipe(
    map((course) =>
      course.codeResources.filter(
        (cr) => cr.programmingLanguageId == this.data.programmingLanguageId
      )
    )
  );

  createSolutionForm: FormGroup;
  ngOnInit(): void {
    this.createSolutionForm = this._formBuilder.group({
      selectedSolutionBlockLanguageId: ["undefined"],
      selectedSolutionCodeResourceId: ["undefined"],
      selectedSolutionCreateType: ["new-code-resource"],
    });
  }

  async onSaveSolution() {
    if (
      this.createSolutionForm.get("selectedSolutionCreateType").value ==
        "copy-code-resource" ||
      this.createSolutionForm.get("selectedSolutionCreateType").value ==
        "reference-code-resource"
    ) {
      await this._mutCreateSolutionFrom
        .mutate({
          assignmentRequiredCodeResourceId: this.data.requiredId,
          codeResourceId: this.createSolutionForm.get(
            "selectedSolutionCodeResourceId"
          ).value,
          deepCopy:
            this.createSolutionForm.get("selectedSolutionCreateType").value ==
            "copy-code-resource",
        })
        .pipe(first())
        .toPromise()
        .then((e) => {
          this.dialogRef.close();
        });
    } else {
      await this._mutCreateSolution
        .mutate({
          assignmentRequiredCodeResourceId: this.data.requiredId,
          blockLanguageId: this.createSolutionForm.get(
            "selectedSolutionBlockLanguageId"
          ).value,
        })
        .pipe(first())
        .toPromise()
        .then((e) => {
          this.dialogRef.close();
        });
    }
  }
}
