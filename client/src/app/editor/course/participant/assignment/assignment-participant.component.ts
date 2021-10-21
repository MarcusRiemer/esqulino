import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";

import { combineLatest, Observable } from "rxjs";
import { first, map, tap } from "rxjs/operators";
import {
  CreateAssignmentSubmittedCodeResourceGQL,
  DestroyAssignmentSubmittedCodeResourceGQL,
  ReferenceTypeEnum,
} from "../../../../../generated/graphql";
import { MessageDialogComponent } from "../../../../shared/message-dialog.component";
import { SidebarService } from "../../../sidebar.service";
import { EditorToolbarService } from "../../../toolbar.service";
import { CourseService } from "../../course.service";
import { CreateAssignmentSubmittedCodeResourceDialogComponent } from "./dialog/create-assignment-submitteed-code-resource-dialog.component";

interface AssignmentEntry {
  id: string;
  name: string;
  description?: string;
  weight: number;
  startDate?: string;
  endDate?: string;
  grade?: number;
  feedback?: string;
  requirements: {
    id: string;
    name: string;
    programmingLanguageId: string;
    referenceType: ReferenceTypeEnum;
    submittedCodeResourceId?: string;
    solution: {
      name: string;
      id: string;
    };
  }[];
}

@Component({
  selector: "assignment-participant",
  templateUrl: "./assignment-participant.component.html",
})
export class AssignmentParticipantComponent implements OnInit {
  constructor(
    private readonly _courseService: CourseService,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _matDialog: MatDialog,
    private readonly _router: Router,
    private readonly _mutCreateAssignmentSubmittedCodeResource: CreateAssignmentSubmittedCodeResourceGQL,
    private readonly _mutDestroyAssignmentSubmittedCodeResource: DestroyAssignmentSubmittedCodeResourceGQL,
    private _toolbarService: EditorToolbarService,
    private _sidebarService: SidebarService
  ) {}

  assignmentId$: Observable<String> = this._activatedRoute.paramMap.pipe(
    map((param) => param.get("assignmentId"))
  );

  assignment$: Observable<AssignmentEntry> = combineLatest([
    this.assignmentId$,
    this._courseService.fullCourseData$,
  ]).pipe(
    map(([assignmentId, course]) => {
      const assignment = course.basedOnProject.assignments.find(
        (assignment) => assignment.id == assignmentId
      );

      const toReturn: AssignmentEntry = {
        ...assignment,
        grade: course?.assignmentSubmissions?.find(
          (a) => a?.assignment?.id == assignmentId
        )?.assignmentSubmissionGradeParticipant?.grade,
        feedback: course?.assignmentSubmissions?.find(
          (a) => a?.assignment?.id == assignmentId
        )?.assignmentSubmissionGradeParticipant?.feedback,
        requirements: assignment.assignmentRequiredCodeResources.map((r) => {
          const submittedCodeResource = course?.assignmentSubmissions
            ?.find((a) => a?.assignment?.id == assignmentId)
            ?.assignmentSubmittedCodeResources?.find(
              (resource) => resource.assignmentRequiredCodeResource.id == r.id
            );
          const codeResourceId = submittedCodeResource?.codeResource.id;

          const toReturn = {
            ...r,
            referenceType: r?.template?.referenceType,
            submittedCodeResourceId: submittedCodeResource?.id,

            solution:
              r?.template?.referenceType == "given_full"
                ? course.basedOnProject.codeResources.find(
                    (res) => res.id === codeResourceId
                  )
                : course.codeResources.find((res) => res.id === codeResourceId),
          };

          return toReturn;
        }),
      };
      return toReturn;
    })
  );

  isDeliveryExceeded: Observable<Boolean> = this.assignment$.pipe(
    map((a) => {
      const today = new Date();
      const endDate = a.endDate ? new Date(a.endDate) : null;
      const startDate = a.startDate ? new Date(a.startDate) : null;
      return (endDate && today > endDate) || (startDate && today < startDate);
    }),
    tap(console.log)
  );

  ngOnInit(): void {
    // Ensure sane default state
    this._sidebarService.hideSidebar();
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;
  }

  async onCreateSubmission(requirement: {
    id: string;
    programmingLanguageId: string;
    referenceType: ReferenceTypeEnum;
  }) {
    const groupId = await this._courseService.courseId$
      .pipe(first())
      .toPromise();

    if (requirement.referenceType != null) {
      await this._mutCreateAssignmentSubmittedCodeResource
        .mutate({
          groupId: groupId,
          requiredCodeResourceId: requirement.id,
        })
        .pipe(first())
        .toPromise()
        .then((e) => this._router.navigate([]));
    } else {
      this._matDialog.open(
        CreateAssignmentSubmittedCodeResourceDialogComponent,
        {
          data: {
            groupId: groupId,
            requiredId: requirement.id,
            programmingLanguageId: requirement.programmingLanguageId,
            referenceType: requirement.referenceType,
          },
        }
      );
    }
  }

  async onDeleteSubmittedCodeResource(
    assignmentSubmittedCodeResourceId: string
  ) {
    const confirmed = await MessageDialogComponent.confirm(this._matDialog, {
      description: $localize`:@@message.ask-delete-resource:Soll diese Resource wirklich gelöscht werden?`,
    });

    if (confirmed) {
      await this._mutDestroyAssignmentSubmittedCodeResource
        .mutate({
          assignmentSubmittedCodeResourceId,
        })
        .pipe(first())
        .toPromise();
    }
  }

  displayedColumns: string[] = [
    "name",
    "type",
    "progammingLanguage",
    "request",
  ];
}
