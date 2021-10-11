import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { first } from "rxjs/operators";
import {
  AcceptInvitationGQL,
  UserListMyParticipantProjectsQuery,
} from "../../../generated/graphql";

//TODO: Marcus, geht das besser ?
//type courseNode = UserListMyParticipantProjectsQuery["projects"]["nodes"][0];//
type participantProjectNode = {
  id;
  hasAccepted;
  basedOnProject: {
    id;
    preview;
    name;
    description;
    selectionGroupType;
    enrollmentEnd;
  };
};
@Component({
  templateUrl: "./participated-list-courses-overview-card.html",
  selector: "participated-list-courses-card",
})
export class ParticipatedListCoursesOverviewCard {
  @Input() course: participantProjectNode;

  constructor(
    private readonly _mutAcceptInvitation: AcceptInvitationGQL,
    private _router: Router
  ) {}

  /**
   * The returned value will start of with '//' and thus be independent
   * from the protocol.
   *
   * @return The image URL of this project.
   */
  get imageUrl(): string {
    return `/api/project/${this.course.id}/image/${this.course.basedOnProject.preview}`;
  }

  /**
   * @return True, if this item has an image
   */
  get hasImage(): boolean {
    return !!this.course?.basedOnProject?.preview;
  }

  enrollmentDateExceeded(): boolean {
    const today: Date = new Date();
    const enrollmentDate: Date = this.course.basedOnProject.enrollmentEnd
      ? new Date(this.course.basedOnProject.enrollmentEnd)
      : null;
    return enrollmentDate && today >= enrollmentDate;
  }

  onAcceptInivation(projectId: string) {
    this._mutAcceptInvitation
      .mutate({ projectId })
      .pipe(first())
      .toPromise()
      .then((result) => this._router.navigate(["../../", "editor", projectId]));
  }
}
