import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { first } from "rxjs/operators";
import {
  JoinCourseGQL,
  UserListCoursesQuery,
} from "../../../generated/graphql";

type courseNode = UserListCoursesQuery["projects"]["nodes"][0];
@Component({
  selector: "course-overview-item",
  templateUrl: "./list-courses-overview-card.html",
})
export class ListCoursesOverviewCard {
  @Input() course: courseNode;

  constructor(
    private readonly _mutJoinCourse: JoinCourseGQL,
    private _router: Router
  ) {}

  onJoinCourse() {
    this._mutJoinCourse
      .mutate({ courseId: this.course.id })
      .pipe(first())
      .toPromise()
      .then((result) =>
        this._router.navigate([
          "editor",
          result.data.joinCourse.project.id,
          "course",
          "participant",
          "overview",
        ])
      );
  }

  /**
   * The returned value will start of with '//' and thus be independent
   * from the protocol.
   *
   * @return The image URL of this project.
   */
  get imageUrl(): string {
    return `/api/project/${this.course.id}/image/${this.course.preview}`;
  }

  /**
   * @return True, if this item has an image
   */
  get hasImage(): boolean {
    return !!this.course?.preview;
  }
}
