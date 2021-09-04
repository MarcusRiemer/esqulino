import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
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
  numberOfToEvaluate: number;
  numberOfFailed: number;
}

interface OverviewGradeEntry {
  groupName: MultiLangString;
  assignmentName: string;
  userGrade: number;
  submissionId: string;
  userName: string;
  gradedBy: string;
}

@Component({
  templateUrl: "./overview-grade.component.html",
})
export class OverviewGradeComponent implements OnInit {
  constructor(
    private readonly _courseService: CourseService,
    private _toolbarService: EditorToolbarService,
    private _sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    // Ensure sane default state
    this._sidebarService.hideSidebar();
    this._toolbarService.resetItems();
  }

  gradeOverview$: Observable<OverviewGradeEntry[]> =
    this._courseService.fullCourseData$.pipe(
      map((course) => {
        const toReturn: OverviewGradeEntry[] = [];
        course?.participantProjects.map((project) =>
          project.assignmentSubmissions.map((submission) =>
            submission.assignmentSubmissionGrades.map((grade) => {
              console.log(submission.assignment.id);
              toReturn.push({
                groupName: project.name,
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
      })
    );

  //TODO: einfacher ?
  assignmentsOverview$ = this._courseService.fullCourseData$.pipe(
    map((course) => {
      const toReturn: OverviewAssignmentEntry[] = course.assignments.map(
        (assignment) => {
          const numberOfFullGradedGroups: number =
            course?.participantProjects?.filter(
              (project) =>
                project?.assignmentSubmissions
                  ?.find(
                    (submission) => submission.assignment?.id === assignment.id
                  )
                  ?.assignmentSubmissionGrades.map(
                    (grade) => grade.auditees?.length
                  )
                  .reduce((acc, cur) => acc + cur, 0) !=
                project.projectMembers?.length
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
            numberOfToEvaluate: numberOfFullGradedGroups,
            numberOfFailed: 1,
          };
          return toReturn;
        }
      );
      return toReturn;
    })
  );

  displayedAssignmentColumns: string[] = [
    "actions",
    "name",
    "group",
    "submission",
    "startDate",
    "endDate",
    "toEvaluate",
    "failed",
  ];

  displayedGradeColumns: string[] = [
    "actions",
    "groupName",
    "assignmentName",
    "auditees",
    "evaluator",
    "grade",
  ];
}
