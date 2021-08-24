import { WHITE_ON_BLACK_CSS_CLASS } from "@angular/cdk/a11y/high-contrast-mode/high-contrast-mode-detector";
import { Time } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first, map } from "rxjs/operators";
import { PerformDataService } from "src/app/shared/authorisation/perform-data.service";
import { CreateAssignmentGQL, ReferenceTypeEnum } from "src/generated/graphql";
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
    private readonly _performData: PerformDataService
  ) {}

  createName: string;
  createDescription: string;
  createStartDate: string;
  createStartDateTime: string;
  createEndDate: string;
  createEndDateTime: string;
  createWeight: number = 1;

  ngOnInit(): void {}

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
      this.createStartDate,
      this.createStartDateTime
    );

    const endDate = this.mergeDateAndTime(
      this.createEndDate,
      this.createEndDateTime
    );

    await this._mutCreateAssignment
      .mutate({
        projectId,
        name: this.createName || undefined,
        description: this.createDescription || undefined,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        weight: this.createWeight || undefined,
      })
      .pipe(first())
      .toPromise()
      .then((e) =>
        this._router.navigate(
          ["assignments/", e.data.createAssignment.project.id],
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
