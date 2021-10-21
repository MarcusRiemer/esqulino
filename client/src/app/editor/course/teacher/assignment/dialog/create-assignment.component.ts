import { WHITE_ON_BLACK_CSS_CLASS } from "@angular/cdk/a11y/high-contrast-mode/high-contrast-mode-detector";
import { Time } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { first, map } from "rxjs/operators";
import { CreateAssignmentGQL } from "../../../../../../generated/graphql";
import { PerformDataService } from "../../../../../shared/authorisation/perform-data.service";

import { SidebarService } from "../../../../sidebar.service";
import { EditorToolbarService } from "../../../../toolbar.service";
import { CourseService } from "../../../course.service";

@Component({
  selector: "app-assignment",
  templateUrl: "./create-assignment.component.html",
})
export class CreateAssignmentComponent implements OnInit {
  constructor(
    private readonly _courseService: CourseService,
    private readonly _mutCreateAssignment: CreateAssignmentGQL,
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _performData: PerformDataService,
    private readonly _toolbarService: EditorToolbarService,
    private readonly _sidebarService: SidebarService,
    private readonly _formBuilder: FormBuilder
  ) {}

  createAssignmentForm = this._formBuilder.group({
    createName: [],
    createDescription: [],
    createStartDate: [],
    createStartDateTime: [],
    createEndDate: [],
    createEndDateTime: [],
    createWeight: [1],
  });

  ngOnInit(): void {
    // Ensure sane default state
    this._sidebarService.hideSidebar();
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;
  }

  /**
   * These permissions are required to create a assignment
   */
  readonly createAssignmentPermission$ = this._courseService.activeCourse$.pipe(
    map((p) => this._performData.project.createAssignment(p.id))
  );

  async createAssignment() {
    const projectId = await this._courseService.courseId$
      .pipe(first())
      .toPromise();

    const startDate = this.mergeDateAndTime(
      this.createAssignmentForm.get("createStartDate").value,
      this.createAssignmentForm.get("createStartDateTime").value
    );

    const endDate = this.mergeDateAndTime(
      this.createAssignmentForm.get("createEndDate").value,
      this.createAssignmentForm.get("createEndDateTime").value
    );

    await this._mutCreateAssignment
      .mutate({
        projectId,
        name: this.createAssignmentForm.get("createName").value || undefined,
        description:
          this.createAssignmentForm.get("createDescription").value || undefined,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        weight:
          this.createAssignmentForm.get("createWeight").value || undefined,
      })
      .pipe(first())
      .toPromise()
      .then((e) =>
        this._router.navigate(
          ["assignments/", e.data.createAssignment.assignment.id],
          { relativeTo: this._activatedRoute.parent }
        )
      );
  }

  //TODO: refactore -> Shared util Datei
  mergeDateAndTime(date: string, time: string): Date {
    let toReturn: Date = date ? new Date(date) : undefined;
    if (!!date) {
      if (!!time) {
        let temp = time.split(":");
        console.log(temp);
        toReturn.setHours(+temp[0] + 2, +temp[1]);
      } else {
        toReturn.setHours(2, 0);
      }
    }
    return toReturn;
  }
}
