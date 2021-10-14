import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, Subscription } from "rxjs";
import { first, map, tap } from "rxjs/operators";
import { SidebarService } from "../../../sidebar.service";
import { EditorToolbarService } from "../../../toolbar.service";
import { CourseService } from "../../course.service";
import { ChangeRequiredCodeResourceDialogComponent } from "../assignment/dialog/change-required-code-resource-dialog.component";

@Component({ templateUrl: "./editor-code-resource-teacher.component.html" })
export class EditorCodeResourceTeacherComponent implements OnInit, OnDestroy {
  constructor(
    private readonly _courseService: CourseService,
    private readonly _activatedRoute: ActivatedRoute,
    private _toolbarService: EditorToolbarService,
    private _sidebarService: SidebarService,
    private readonly _matDialog: MatDialog
  ) {}

  private _subscriptionRefs: Subscription[] = [];

  ngOnInit(): void {
    // Ensure sane default state
    this._sidebarService.hideSidebar();
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = true;

    const btnCreate = this._toolbarService.addButton(
      "create",
      "Bearbeite Beschreibung",
      "pencil ",
      undefined,
      undefined
    );
    const refClone = btnCreate.onClick.subscribe(async (_) => {
      let required = await this.required$.pipe(first()).toPromise();

      this._matDialog.open(ChangeRequiredCodeResourceDialogComponent, {
        data: {
          requirementId: required.id,
          requirementName: required.name,
          requirementDescription: required.description,
        },
      });
    });

    this._subscriptionRefs.push(refClone);
  }

  /**
   * Cleans up all acquired references
   */
  ngOnDestroy() {
    this._subscriptionRefs.forEach((ref) => ref.unsubscribe());
    this._subscriptionRefs = [];
  }

  requiredId$ = this._activatedRoute.paramMap.pipe(
    map((param) => param.get("requiredId")),
    tap(console.log)
  );
  assignmentId$ = this._activatedRoute.paramMap.pipe(
    map((param) => param.get("assignmentId")),
    tap(console.log)
  );

  codeResourceId$ = this._activatedRoute.paramMap.pipe(
    map((param) => param.get("codeResourceId")),
    tap(console.log)
  );

  assignment$ = combineLatest([
    this.assignmentId$,
    this._courseService.fullCourseData$,
  ]).pipe(map(([id, course]) => course.assignments.find((a) => a.id == id)));

  required$ = combineLatest([this.requiredId$, this.assignment$]).pipe(
    map(([id, assignment]) =>
      assignment.assignmentRequiredCodeResources.find(
        (required) => required.id == id
      )
    )
  );

  codeResource$ = combineLatest([
    this.codeResourceId$,
    this._courseService.fullCourseData$,
  ]).pipe(
    map(([codeId, course]) =>
      course.codeResources.find((code) => code.id == codeId)
    )
  );
}
