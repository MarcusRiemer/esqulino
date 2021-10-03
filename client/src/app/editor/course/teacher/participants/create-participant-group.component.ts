import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { first } from "rxjs/operators";
import { CurrentLocaleService } from "src/app/current-locale.service";
import { MultiLangString } from "src/app/shared/multilingual-string.description";
import { CreateProjectCourseParticipationGQL } from "src/generated/graphql";
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
    private readonly _fromBuilder: FormBuilder
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
        userIds: [],
      })
      .pipe(first())
      .toPromise()
      .then((e) => this.createGroup.reset());
  }
}
