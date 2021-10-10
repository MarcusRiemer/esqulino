import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";
import { CreateProjectCourseParticipationsGQL } from "../../../../../generated/graphql";
import { CurrentLocaleService } from "../../../../current-locale.service";
import { CourseService } from "../../course.service";
import { CreateParticipantGroup } from "./create-participant-group.component";

@Component({
  selector: "create-participant-groups",
  templateUrl: "./create-participant-groups.component.html",
})
export class CreateParticipantGroupsComponent implements OnInit {
  createGroups: FormGroup;

  constructor(
    private readonly _locale: CurrentLocaleService,
    private readonly _courseService: CourseService,
    private readonly _fromBuilder: FormBuilder,
    private readonly _mutCreateProjectCourseParticipation: CreateProjectCourseParticipationsGQL,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _router: Router
  ) {}

  ngOnInit(): void {
    this.createGroups = this._fromBuilder.group({
      groupNumber: [1],
      groupName: [null],
      nameCounter: [1],
    });
  }

  async onSubmit() {
    const courseId = await this._courseService.courseId$
      .pipe(first())
      .toPromise();
    this._mutCreateProjectCourseParticipation
      .mutate({
        basedOnProjectId: courseId,
        numberOfGroups: this.createGroups.controls["groupNumber"].value,
        name: this.createGroups.controls["groupName"].value,
        startNameCounter: this.createGroups.controls["nameCounter"].value,
      })
      .pipe(first())
      .toPromise()
      .then((e) =>
        this._router.navigate(["../../"], { relativeTo: this._activatedRoute })
      );
  }
}
