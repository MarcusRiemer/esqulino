import { Component } from "@angular/core";
import { Observable } from "rxjs";
import { map, pluck } from "rxjs/operators";
import { ProjectService } from "../../../project.service";
import { CourseService } from "../../course.service";

interface ProjectMember {
  id: string;
  displayName: string;
  roleName: string;
  joinedAt: Date;
  changedRole: string;
}

@Component({
  templateUrl: "./overview-participants-participant.component.html",
})
export class OverviewParticipantsPrticipantComponent {
  constructor(private readonly _courseProject: CourseService) {}

  /**
   * Necessary for the material table
   */
  readonly displayedColumns: string[] = ["displayName", "roleName", "joinedAt"];

  readonly owner$ = this._courseProject.fullCourseData$.pipe(pluck("user"));

  readonly members$: Observable<ProjectMember[]> =
    this._courseProject.fullCourseData$.pipe(
      pluck("projectMembers"),
      map((members) => {
        return members.map((singleMember) => ({
          id: singleMember.user.id,
          displayName: singleMember.user.displayName,
          roleName: singleMember.membershipType,
          joinedAt: singleMember.joinedAt
            ? new Date(singleMember.joinedAt)
            : null,
          changedRole: singleMember.membershipType,
        }));
      })
    );
}
