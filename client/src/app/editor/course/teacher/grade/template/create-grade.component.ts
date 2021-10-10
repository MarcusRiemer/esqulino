import { noUndefined } from "@angular/compiler/src/util";
import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { first, map } from "rxjs/operators";
import {
  CreateAssignmentSubmissionGradeGQL,
  MutationCreateAssignmentSubmissionGradeArgs,
} from "../../../../../../generated/graphql";
import { PerformDataService } from "../../../../../shared/authorisation/perform-data.service";
import { CourseService } from "../../../course.service";
import { CreateGradeEntry } from "./create-grade-setting.component";

@Component({
  templateUrl: "create-grade.component.html",
  selector: "create-grade",
})
export class CreateGradeComponent implements OnInit {
  @Input()
  public assignmentSubmissionId: string;

  @Input()
  public evaluatedPeopleIds: CreateGradeEntry;
  async ngOnChanges(changes: SimpleChanges) {
    console.log("------------------");
    console.log(changes.evaluatedPeopleIds.currentValue);
    this.createGradeForm = this._fromBuilder.group({
      grade: [1],
      feedback: [""],
    });
    if (changes.evaluatedPeopleIds.currentValue == undefined) {
      const project = await this._courseService.fullCourseData$
        .pipe(
          map((course) =>
            course?.participantProjects?.find((project) =>
              project.assignmentSubmissions?.some(
                (submission) => submission.id === this.assignmentSubmissionId
              )
            )
          ),
          first()
        )
        .toPromise();

      const member = project.projectMembers.length;
      const submission = project.assignmentSubmissions.find(
        (submission) => submission.id == this.assignmentSubmissionId
      );
      console.log(submission);

      if (submission.assignmentSubmissionGrades.length == 1) {
        const grade = submission.assignmentSubmissionGrades[0];
        if (grade.auditees.length == member) {
          console.log(member);
          this.createGradeForm.get("grade").setValue(grade.grade);
          this.createGradeForm.get("feedback").setValue(grade.feedback);
        }
      }
    } else {
      console.log("asdad----");
      this.createGradeForm
        .get("grade")
        .setValue(changes.evaluatedPeopleIds.currentValue.grade);
      this.createGradeForm
        .get("feedback")
        .setValue(changes.evaluatedPeopleIds.currentValue.gradeFeedback);

      console.log(this.createGradeForm.get("grade").value);
      console.log(this.createGradeForm.get("feedback").value);
    }
  }

  constructor(
    private readonly _courseService: CourseService,
    private readonly _fromBuilder: FormBuilder,
    private readonly _mutCreateGrade: CreateAssignmentSubmissionGradeGQL,
    private readonly _performData: PerformDataService
  ) {}

  createGradeForm: FormGroup;

  ngOnInit(): void {
    this.createGradeForm = this._fromBuilder.group({
      grade: [1],
      feedback: [""],
    });
  }

  /**
   * These permissions are required to create a feedback
   */
  readonly createAssignmentSubmissionGrade$ =
    this._courseService.activeCourse$.pipe(
      map((p) =>
        this._performData.project.createAssignmentSubmissionGrade(p.id)
      )
    );

  async onCreateGrade() {
    console.log("asdasdadasdsa");
    console.log(this.createGradeForm.get("grade").value);
    console.log(this.createGradeForm.get("feedback").value);
    //this.createGradeForm.get("grade").setValue(3);

    const evaluatedPeopleIds: string[] = this.evaluatedPeopleIds
      ? [this.evaluatedPeopleIds.userId]
      : await this._courseService.fullCourseData$
          .pipe(
            map((course) =>
              course?.participantProjects
                ?.find((project) =>
                  project.assignmentSubmissions?.some(
                    (submission) =>
                      submission.id === this.assignmentSubmissionId
                  )
                )
                .projectMembers.map((member) => member.user.id)
            ),
            first()
          )
          .toPromise();
    await this._mutCreateGrade
      .mutate({
        assignmentSubmissionId: this.assignmentSubmissionId,
        feedback: this.createGradeForm.controls["feedback"].value,
        grade: this.createGradeForm.controls["grade"].value,
        evalutedPeopleIds: evaluatedPeopleIds,
      })
      .pipe(first())
      .toPromise();
  }
}
