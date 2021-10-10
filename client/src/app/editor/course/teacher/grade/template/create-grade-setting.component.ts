import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, Observable } from "rxjs";
import { first, map, pluck, startWith, tap } from "rxjs/operators";
import { GrammarDescriptionItemDocument } from "../../../../../../generated/graphql";

import { CourseService } from "../../../course.service";

export interface CreateGradeEntry {
  userName: string;
  userId: string;
  grade: number;
  gradeFeedback: string;
}

@Component({
  selector: "create-grade-setting",
  templateUrl: "create-grade-setting.component.html",
})
export class CreateGradeSettingComponent implements OnDestroy {
  constructor(
    private readonly _courseService: CourseService,
    private readonly _activatedRoute: ActivatedRoute
  ) {}
  ngOnDestroy(): void {
    this.subscribtion.unsubscribe();
  }

  groupGrading: boolean = false;

  selectedUser: number = 0;

  //TODO: Marcuuuus, geht das besser ?
  users: CreateGradeEntry[];

  upUser() {
    if (this.selectedUser < this.users?.length - 1) {
      this.selectedUser += 1;
    }
  }
  downUser() {
    if (this.selectedUser > 0) {
      this.selectedUser -= 1;
    }
  }

  paramSubmissionId$: Observable<string> = this._activatedRoute.paramMap.pipe(
    map((p) => p.get("submissionId"))
  );

  participantCourse$ = combineLatest([
    this._courseService.fullCourseData$,
    this.paramSubmissionId$,
  ]).pipe(
    map(([course, id]) =>
      course.participantProjects.find((project) =>
        project.assignmentSubmissions.some((submission) => submission.id === id)
      )
    )
  );

  submission$ = combineLatest([
    this.participantCourse$,
    this.paramSubmissionId$,
  ]).pipe(
    map(([course, id]) =>
      course.assignmentSubmissions.find((submission) => submission.id === id)
    )
  );

  participantCourseMember$ = this.participantCourse$.pipe(
    pluck("projectMembers")
  );

  //TODO: geht einfacher
  subscribtion = combineLatest([
    this.submission$,
    this.participantCourseMember$,
  ])
    .pipe(
      tap(([submission, members]) => {
        //TODO: Marcus, darf ich tap so verwenden oder ist es eine entartung ?
        this.groupGrading =
          submission.assignmentSubmissionGrades.length > 1 ||
          submission?.assignmentSubmissionGrades[0]?.auditees.length !=
            members.length;
      }),
      map(([submission, members]) =>
        members.map((member) => ({
          userName: member.user.displayName,
          userId: member.user.id,
          grade: submission?.assignmentSubmissionGrades?.find((grade) =>
            grade.auditees.some((audite) => audite.id === member.user.id)
          )?.grade,
          gradeFeedback: submission?.assignmentSubmissionGrades?.find((grade) =>
            grade.auditees.some((audite) => audite.id === member.user.id)
          )?.feedback,
        }))
      ),
      tap(console.log)
    )
    .subscribe((result: CreateGradeEntry[]) => {
      this.users = result;
      this.selectedUser = 0;
    });

  readonly renderDataReady$ = combineLatest([
    this.participantCourse$,
    this.participantCourse$,
  ]).pipe(map((renderData) => renderData.every((d) => !!d), startWith(false)));
}
