import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { SidebarService } from "../../../sidebar.service";
import { EditorToolbarService } from "../../../toolbar.service";
import { CourseService } from "../../course.service";

@Component({
  templateUrl: "./to-grade.component.html",
})
export class ToGradeComponent implements OnInit {
  toGrade: FormGroup;

  constructor(
    private readonly _courseService: CourseService,
    private readonly _activatedRoute: ActivatedRoute
  ) {}

  assignmentSubmissionId$: Observable<string> =
    this._activatedRoute.paramMap.pipe(map((p) => p.get("submissionId")));

  //TODO: Show compiled files
  codeResources = combineLatest([
    this.assignmentSubmissionId$,
    this._courseService.fullCourseData$,
  ]).pipe(
    map(([id, course]) => {
      course.assignmentSubmissions
        .find((submission) => submission.id == id)
        .assignmentSubmittedCodeResources.map(
          (submitted) => submitted.codeResource
        );
    })
  );

  ngOnInit() {
    // Ensure sane default state
  }
}
