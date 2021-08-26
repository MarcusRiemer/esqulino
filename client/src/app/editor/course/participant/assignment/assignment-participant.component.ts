import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Params, Router } from "@angular/router";

import { Observable } from "rxjs";
import { first, map, mergeMap, tap } from "rxjs/operators";
import {
  CreateAssignmentSubmittedCodeResourceGQL,
  ReferenceTypeEnum,
} from "../../../../../generated/graphql";
import { MessageDialogComponent } from "../../../../shared/message-dialog.component";
import { CurrentCodeResourceService } from "../../../current-coderesource.service";
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
    private readonly _mutCreateAssignmentSubmittedCodeResource: CreateAssignmentSubmittedCodeResourceGQL
  ) {}
  ngOnInit(): void {
    this._activatedRoute.params.forEach(
      (param: Params) =>
        (this.assignment$ = this._courseService.fullCourseData$.pipe(
          map((course) => {
            const assignment = course.basedOnProject.assignments.find(
              (assignment) => assignment.id == param["assignmentId"]
            );

            const toReturn: AssignmentEntry = {
              ...assignment,
              grade: course?.assignmentSubmissions?.find(
                (a) => a?.assignment?.id == param["assignmentId"]
              ).assignmentSubmissionGradeParticipant?.grade,
              feedback: course?.assignmentSubmissions?.find(
                (a) => a?.assignment?.id == param["assignmentId"]
              ).assignmentSubmissionGradeParticipant?.feedback,
              requirements: assignment.assignmentRequiredCodeResources.map(
                (r) => {
                  const codeResourceId = course?.assignmentSubmissions
                    ?.find((a) => a?.assignment?.id == param["assignmentId"])
                    ?.assignmentSubmittedCodeResources?.find(
                      (resource) =>
                        resource.assignmentRequiredCodeResource.id == r.id
                    )?.codeResource.id;

                  const toReturn = {
                    ...r,
                    referenceType: r?.template?.referenceType,
                    solution:
                      r?.template?.referenceType == "given_full"
                        ? course.basedOnProject.codeResources.find(
                            (res) => res.id === codeResourceId
                          )
                        : course.codeResources.find(
                            (res) => res.id === codeResourceId
                          ),
                  };

                  return toReturn;
                }
              ),
            };
            return toReturn;
          }),
          tap((e) => {
            console.log("---------");
            console.log(e);
          })
        ))
    );
  }

  async onCreateSubmission(requirement: {
    id: string;
    programmingLanguageId: string;
    referenceType: ReferenceTypeEnum;
  }) {
    const groupId = await this._courseService.courseId$
      .pipe(first())
      .toPromise();

    if (requirement.referenceType == "given_full") {
      await this._mutCreateAssignmentSubmittedCodeResource
        .mutate({
          groupId: groupId,
          requiredCodeResourceId: requirement.id,
        })
        .pipe(first())
        .toPromise()
        .then((e) => this._router.navigate([]));
    }

    this._matDialog.open(CreateAssignmentSubmittedCodeResourceDialogComponent, {
      data: {
        groupId: groupId,
        requiredId: requirement.id,
        programmingLanguageId: requirement.programmingLanguageId,
        referenceType: requirement.referenceType,
      },
    });
  }

  async onDeleteSubmittedCodeResource() {
    const confirmed = await MessageDialogComponent.confirm(this._matDialog, {
      description: $localize`:@@message.ask-delete-resource:Soll diese Resource wirklich gelöscht werden?`,
    });

    if (confirmed) {
      //TODO
    }
  }

  assignment$: Observable<AssignmentEntry>;

  displayedColumns: string[] = ["name", "type", "request", "problem"];
}
