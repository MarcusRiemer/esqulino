import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { Observable, Subscription } from "rxjs";
import { map, tap } from "rxjs/operators";
import { MultiLangString } from "../../../../shared/multilingual-string.description";
import { SidebarService } from "../../../sidebar.service";
import { EditorToolbarService } from "../../../toolbar.service";
import { CourseService } from "../../course.service";

interface OverviewAssignmentEntry {
  assignmentName: string;
  numberOfGroups: number;
  numberOfSubmissions: number;
  assingmentStartDate?: string;
  assignmentEndDate?: string;
  numberOfGradedGroups: number;
  numberOfFailed: number;
}

interface OverviewGradeEntry {
  groupName: MultiLangString;
  assignmentName: string;
  assignmentWeight: number;
  userGrade: number;
  submissionId: string;
  userName: string;
  gradedBy: string;
}

@Component({
  templateUrl: "./overview-grade.component.html",
})
export class OverviewGradeComponent implements OnInit, OnDestroy {
  constructor(
    private readonly _courseService: CourseService,
    private _toolbarService: EditorToolbarService,
    private _sidebarService: SidebarService
  ) {}

  private _subscriptionRefs: Subscription[] = [];

  ngOnInit(): void {
    // Ensure sane default state
    this._sidebarService.hideSidebar();
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;

    this._subscriptionRefs.push(
      this._courseService.fullCourseData$
        .pipe(
          map((course) => {
            const toReturn: OverviewGradeEntry[] = [];
            course?.participantProjects.map((project) =>
              project.assignmentSubmissions.map((submission) =>
                submission.assignmentSubmissionGrades.map((grade) => {
                  console.log(submission.assignment.id);
                  toReturn.push({
                    groupName: project.name,
                    assignmentWeight: course.assignments.find(
                      (a) => a.id === submission.assignment.id
                    )?.weight,
                    submissionId: submission.id,
                    assignmentName: course.assignments.find(
                      (a) => a.id === submission.assignment.id
                    )?.name,
                    userGrade: grade.grade,
                    userName: grade.auditees
                      .map((user) => user.displayName)
                      .reduce((a, b) => a + " " + b),
                    gradedBy: grade.user.displayName,
                  });
                })
              )
            );
            return toReturn;
          }),
          tap(console.log)
        )
        .subscribe(
          (result) => (this.dataSource = new MatTableDataSource(result))
        )
    );
  }

  /**
   * Cleans up all acquired references
   */
  ngOnDestroy() {
    this._subscriptionRefs.forEach((ref) => ref.unsubscribe());
    this._subscriptionRefs = [];
  }

  //TODO: einfacher ?
  assignmentsOverview$ = this._courseService.fullCourseData$.pipe(
    map((course) => {
      const toReturn: OverviewAssignmentEntry[] = course.assignments.map(
        (assignment) => {
          const numberOfFullGradedGroups: number = course?.participantProjects
            ?.filter(
              (project) =>
                project?.assignmentSubmissions?.find(
                  (submission) => submission.assignment?.id === assignment.id
                )?.assignmentSubmissionGrades.length > 0
            )
            .filter(
              (project) =>
                project?.assignmentSubmissions
                  ?.find(
                    (submission) => submission.assignment?.id === assignment.id
                  )
                  ?.assignmentSubmissionGrades.map(
                    (grade) => grade.auditees?.length
                  )
                  .reduce((acc, cur) => acc + cur, 0) !=
                project.projectMembers?.length - 1
            ).length;

          const toReturn = {
            assignmentName: assignment.name,
            assignmentStartDate: assignment.startDate,
            assignmentEndDate: assignment.endDate,
            numberOfGroups: course?.participantProjects?.length,
            numberOfSubmissions: course?.participantProjects.filter(
              (project) =>
                !!project?.assignmentSubmissions?.find(
                  (submission) => submission.assignment.id === assignment.id
                )
            )?.length,
            numberOfGradedGroups: numberOfFullGradedGroups,
            numberOfFailed: 1,
          };
          return toReturn;
        }
      );
      return toReturn;
    })
  );

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  gradeOverview: OverviewGradeEntry[] = [];

  dataSource = new MatTableDataSource(this.gradeOverview);

  displayedAssignmentColumns: string[] = [
    "name",
    "group",
    "startDate",
    "endDate",
    "submission",
    "numberOfGradedGroups",

    "toEvaluate",
  ];

  displayedGradeColumns: string[] = [
    "groupName",
    "assignmentName",
    "auditees",
    "evaluator",
    "assignmentWeight",
    "grade",
    "actions",
  ];
}
