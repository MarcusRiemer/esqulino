import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";
import { CreateProjectCourseParticipationGQL } from "../../../../../generated/graphql";
import { CurrentLocaleService } from "../../../../current-locale.service";
import { MultiLangString } from "../../../../shared/multilingual-string.description";

import { CourseService } from "../../course.service";

@Component({
  templateUrl: "create-participant-group.component.html",
  selector: "create-participant-group",
})
export class CreateParticipantGroup implements OnInit {
  createGroup: FormGroup;

  constructor(
    private readonly _locale: CurrentLocaleService,
    private readonly _courseService: CourseService,
    private readonly _mutCreateCourseParticipation: CreateProjectCourseParticipationGQL,
    private readonly _fromBuilder: FormBuilder,
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.createGroup = this._fromBuilder.group({
      groupName: [null],
      userIds: [null],
    });
  }

  async createCourseParticipation() {
    const courseId = await this._courseService.courseId$
      .pipe(first())
      .toPromise();

    const localizedName: MultiLangString = {};
    localizedName[this._locale.localeId] =
      this.createGroup.controls["groupName"].value;

    this._mutCreateCourseParticipation
      .mutate({
        basedOnProjectId: courseId,
        groupName: localizedName,
        userIds: this.createGroup.controls["userIds"].value
          ? this.createGroup.controls["userIds"].value.split(",")
          : [],
      })
      .pipe(first())
      .toPromise()
      .then((e) =>
        this._router.navigate(["../../"], { relativeTo: this._activatedRoute })
      );
  }
}
