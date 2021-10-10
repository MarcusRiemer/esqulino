import { formatDate } from "@angular/common";
import { Component, Inject, LOCALE_ID, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { first, map, pluck, tap } from "rxjs/operators";
import {
  SelectionGroupTypeEnum,
  UpdateProjectGroupSettingsGQL,
} from "../../../generated/graphql";
import { CourseService } from "../course/course.service";

@Component({
  selector: "course-group-settings",
  templateUrl: "templates/course-group-settings.html",
})
export class CourseGroupSettingsComponent implements OnInit {
  constructor(
    private readonly _mutUpdateProjectGroupeSettings: UpdateProjectGroupSettingsGQL,
    private readonly _courseService: CourseService,
    private readonly _fromBuilder: FormBuilder,
    @Inject(LOCALE_ID) private _locale: string
  ) {}

  updateGroupSettings: FormGroup;

  ngOnInit(): void {
    this.updateGroupSettings = this._fromBuilder.group({
      public: [null],
      groupType: ["auto-create-groups"],
      groupsAreGiven: [null],
      selfSelection: [null],
      limitNumberOfGroups: [null],
      maxNumberOfMembers: [1],
      maxNumberOfGroups: [1],
      startDate: [null],
      startTime: [null],
      endDate: [null],
      endTime: [null],
    });
  }

  onRadioButton(value: String) {
    console.log(value);
    if (value == "auto-create-groups") {
      this.updateGroupSettings.get("selfSelection").setValue(null);
    }
    if (value == "self-create-groups") {
      this.updateGroupSettings.get("limitNumberOfGroups").setValue(null);
      this.updateGroupSettings.get("maxNumberOfGroups").setValue(null);
    }
  }

  course$ = this._courseService.fullCourseData$.pipe(
    tap((e) => console.log("neu")),
    map((course) => {
      const groupType =
        course.selectionGroupType == "as_many_groups_as_was_created" ||
        course.selectionGroupType == "self_selection"
          ? "self-create-groups"
          : "auto-create-groups";
      return {
        numberOfExistingGroups: course.participantProjects?.length,
        courseId: course.id,
        public: course.public,
        groupType,
        selfSelection: course.selectionGroupType == "self_selection",
        groupsAreGiven:
          course.selectionGroupType == "as_many_groups_as_was_created" ||
          course.selectionGroupType == "self_selection",
        limitNumberOfGroups:
          course.selectionGroupType == "fixed_number_of_groups",
        maxNumberOfMembers: course.maxGroupSize ? course.maxGroupSize : 1,
        maxNumberOfGroups: course.maxNumberOfGroups,
        startDate: course.enrollmentStart
          ? formatDate(course.enrollmentStart, "yyyy-MM-dd", this._locale)
          : undefined,
        startTime: course.enrollmentStart
          ? formatDate(course.enrollmentStart, "HH:mm", this._locale)
          : undefined,
        endDate: course.enrollmentEnd
          ? formatDate(course.enrollmentEnd, "yyyy-MM-dd", this._locale)
          : undefined,
        endTime: course.enrollmentEnd
          ? formatDate(course.enrollmentEnd, "HH:mm", this._locale)
          : undefined,
      };
    }),
    tap((course) => this.updateGroupSettings.patchValue(course)),
    tap(console.log)
  );

  async onUpdateGroupSettings() {
    this.updateGroupSettings.get("maxNumberOfMembers").value;
    const tempStartDate = this.mergeDateAndTime(
      this.updateGroupSettings.get("startDate").value,
      this.updateGroupSettings.get("startTime").value
    );
    const tempEndDate = this.mergeDateAndTime(
      this.updateGroupSettings.get("endDate").value,
      this.updateGroupSettings.get("endTime").value
    );

    const projectId = await this._courseService.activeCourse$
      .pipe(first(), pluck("id"))
      .toPromise();

    let selectionGroupType: SelectionGroupTypeEnum;

    if (
      this.updateGroupSettings.get("groupType").value == "self-create-groups"
    ) {
      if (this.updateGroupSettings.get("selfSelection").value) {
        selectionGroupType = "self_selection";
      } else {
        selectionGroupType = "as_many_groups_as_was_created";
      }
    }

    if (this.updateGroupSettings.get("limitNumberOfGroups").value) {
      selectionGroupType = "fixed_number_of_groups";
    }
    if (selectionGroupType == null) {
      selectionGroupType = "no_group_number_limitation";
    }

    this._mutUpdateProjectGroupeSettings
      .mutate({
        id: projectId,
        maxGroupSize: this.updateGroupSettings.get("maxNumberOfMembers").value,
        maxNumberOfGroups:
          this.updateGroupSettings.get("maxNumberOfGroups").value,
        selectionGroupType: selectionGroupType,
        enrollmentStart: tempStartDate,
        enrollmentEnd: tempEndDate,
        public: this.updateGroupSettings.get("public").value,
      })
      .pipe(first())
      .toPromise();
  }

  //TODO: refactore and merge with the function in the create assingment
  mergeDateAndTime(date: string, time: string): string {
    let toReturn: Date = date ? new Date(date) : undefined;
    if (!!date) {
      if (!!time) {
        let temp = time.split(":");
        toReturn.setHours(+temp[0], +temp[1]);
      } else {
        toReturn.setHours(0, 0);
      }
    }
    return toReturn?.toISOString();
  }
}
