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
import { CourseService } from "../../course.service";
import { PerformDataService } from "../../../../shared/authorisation/perform-data.service";
import { ToolbarService } from "../../../../shared";
import { SidebarService } from "../../../sidebar.service";
import { EditorToolbarService } from "../../../toolbar.service";
import { ProjectService } from "../../../project.service";
import { MessageDialogComponent } from "../../../../shared/message-dialog.component";

@Component({
  selector: "app-overview-assignment",
  templateUrl: "./overview-assignment.component.html",
})
export class AssignmentOverviewComponent implements OnInit {
  constructor(
    private readonly _courseService: CourseService,
    private readonly _projectService: ProjectService,
    private _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _mutDestroyAssignment: DestroyAssignmentGQL,
    private readonly _matDialog: MatDialog,
    private readonly _performData: PerformDataService,
    private readonly _toolbarService: EditorToolbarService,
    private _sidebarService: SidebarService
  ) {}

  async onDestroyAssignment(assignmentId: string) {
    const confirmed = await MessageDialogComponent.confirm(this._matDialog, {
      description: $localize`:@@message.ask-delete-resource:Soll diese Aufgabe wirklich gelöscht werden?`,
    });

    if (confirmed) {
      await this._mutDestroyAssignment
        .mutate({
          id: assignmentId,
        })
        .pipe(first())
        .toPromise();
    }
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
    "name",
    "startDate",
    "endDate",
    "weight",
    "actions",
  ];

  /**
   * @return A peek at the project of the currently edited resource
   */
  get peekProject() {
    return this._projectService.cachedProject;
  }

  ngOnInit(): void {
    // Ensure sane default state
    this._sidebarService.hideSidebar();
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;
    //------
    // Making a copy
    const btnCreate = this._toolbarService.addButton(
      "create",
      "Augabe erstellen",
      "files-o",
      undefined,
      this._performData.project.createAssignment(this.peekProject.id)
    );
    const refClone = btnCreate.onClick.subscribe((_) => {
      this._router.navigate(["create/assignment"], {
        relativeTo: this._activatedRoute.parent,
      });
    });
  }
}
