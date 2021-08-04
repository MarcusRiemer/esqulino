import { WHITE_ON_BLACK_CSS_CLASS } from "@angular/cdk/a11y/high-contrast-mode/high-contrast-mode-detector";
import { Time } from "@angular/common";
import { Component, Inject, Input, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { find, first, map } from "rxjs/operators";
import { PerformDataService } from "src/app/shared/authorisation/perform-data.service";
import {
  CreateAssignmentGQL,
  CreateAssignmentRequiredSolutionGQL,
  ReferenceTypeEnum,
  SelectionListBlockLanguagesGQL,
} from "src/generated/graphql";
import { CourseService } from "../../course.service";

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
    private readonly _mutCreateCodeResourceSolution: CreateAssignmentRequiredSolutionGQL
  ) {}

  availableBlockLanguages$ = this._courseService.fullCourseData$.pipe(
    map((course) => course.blockLanguages)
  );

  solutionBlockLanguageId: string;
  ngOnInit(): void {
    console.log(this.data.programmingLanguageId);
    this.availableBlockLanguages$ = this._courseService.fullCourseData$.pipe(
      map((course) =>
        course.blockLanguages.filter(
          (blockLanguage) =>
            blockLanguage.defaultProgrammingLanguageId ==
            this.data.programmingLanguageId
        )
      )
    );
  }

  async saveSolution() {
    await this._mutCreateCodeResourceSolution
      .mutate({
        assignmentRequiredCodeResourceId: this.data.requiredId,
        blockLanguageId: this.solutionBlockLanguageId,
      })
      .pipe(first())
      .toPromise()
      .then((e) => {
        this.dialogRef.close();
      });
  }
}
