import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import e from "express";
import { first, map } from "rxjs/operators";

import { UpdateAssignmentDialogComponent } from "./dialog/update-assignment-dialog.component";
import {
  Assignment,
  AssignmentTemplateCodeResource,
  DestroyAssignmentGQL,
} from "src/generated/graphql";
import Observable from "zen-observable";
import { CourseService } from "../course.service";
import { PerformDataService } from "../../../shared/authorisation/perform-data.service";

@Component({
  selector: "app-overview-assignment",
  templateUrl: "./overview-assignment.component.html",
  styleUrls: ["./overview-assignment.component.scss"],
})
export class AssignmentOverviewComponent implements OnInit {
  constructor(
    private readonly _courseService: CourseService,
    private _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _mutDestroyAssignment: DestroyAssignmentGQL,
    private readonly _matDialog: MatDialog,
    private readonly _performData: PerformDataService
  ) {}

  async onDestroyAssignment(assignmentId: string) {
    await this._mutDestroyAssignment
      .mutate({
        id: assignmentId,
      })
      .pipe(first())
      .toPromise();
  }
  onEditAssignment(assignmentId: {
    id: string;
    startDate: string;
    endDate: string;
    weight: string;
  }) {}
  onEditSingelAssignment(assignment: Assignment) {
    this._matDialog.open(UpdateAssignmentDialogComponent, {
      data: {
        ...assignment,
      },
    });
  }

  /**
   * These permissions are required to add a member
   */
  readonly createAssignmentPermission$ = this._courseService.activeCourse$.pipe(
    map((p) => this._performData.project.createAssignment(p.id))
  );

  /**
   * These permissions are required to add a member
   */
  readonly updateAssignmentPermission$ = this._courseService.activeCourse$.pipe(
    map((p) => this._performData.project.updateAssignment(p.id))
  );

  /**
   * These permissions are required to add a member
   */
  readonly deleteAssignmentPermission$ = this._courseService.activeCourse$.pipe(
    map((p) => this._performData.project.deleteAssignment(p.id))
  );

  readonly $assignments = this._courseService.fullAssignments$;

  displayedColumns: string[] = [
    "actions",
    "name",
    "startDate",
    "endDate",
    "weight",
  ];

  ngOnInit(): void {}

  createAssignment(): void {
    this._router.navigate(["create/assignment"], {
      relativeTo: this._activatedRoute.parent,
    });
  }
}
