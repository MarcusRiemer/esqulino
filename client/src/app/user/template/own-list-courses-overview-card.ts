import { Component, Input } from "@angular/core";
import { UserListOwnCoursesQuery } from "../../../generated/graphql";

type courseNode = UserListOwnCoursesQuery["projects"]["nodes"][0];
@Component({
  templateUrl: "./own-list-courses-overview-card.html",
  selector: "own-list-courses-card",
})
export class OwnListCoursesOverviewCard {
  @Input() course: courseNode;

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
