import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { MultiLangString } from "../../../../shared/multilingual-string.description";
import { SidebarService } from "../../../sidebar.service";
import { EditorToolbarService } from "../../../toolbar.service";
import { CourseService } from "../../course.service";

interface ToGradeEntry {
  assignmentName: string;
  groupName: MultiLangString;
  submissionId: string;
  assignmentEndDate: string;
  numberOfRatedParticipants: number;
  numberOfGroupMember: number;
  numberOfSubmittedFiles: number;
  numberOfRequiredFiles: number;
}

@Component({
  templateUrl: "./to-grade-list.component.html",
})
export class ToGradeListComponent implements OnInit {
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

  toGrade$: Observable<ToGradeEntry[]> =
    this._courseService.fullCourseData$.pipe(
      map((course) => {
        const toReturn: ToGradeEntry[] = [];
        course.participantProjects.map((project) =>
          project.assignmentSubmissions.map((submission) => {
            toReturn.push({
              submissionId: submission.id,
              numberOfRatedParticipants: submission.assignmentSubmissionGrades
                .map((grade) => grade.auditees.length)
                ?.reduce((acc, cur) => acc + cur, 0),
              numberOfGroupMember: project.projectMembers.length,
              assignmentName: course.assignments.find(
                (assignments) => submission.assignment.id === assignments.id
              ).name,
              numberOfRequiredFiles: course.assignments.find(
                (assignments) => submission.assignment.id === assignments.id
              ).assignmentRequiredCodeResources.length,
              groupName: project.name,
              assignmentEndDate: course.assignments.find(
                (assignments) => submission.assignment.id === assignments.id
              ).endDate,
              numberOfSubmittedFiles:
                submission.assignmentSubmittedCodeResources.length,
            });
          })
        );
        return toReturn;
      })
    );

  displayedToGradeColumns: string[] = [
    "actions",
    "assignmentName",
    "groupName",
    "assignmentEndDate",
    "numberOfSubmittedFiles",
    "numberOfRatedParticipants",
  ];
}
