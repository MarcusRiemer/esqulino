import { Component } from "@angular/core";
import { combineLatest } from "rxjs";
import { map, pluck, tap } from "rxjs/operators";
import Observable from "zen-observable";
import {
  UserListMyParticipantProjectsGQL,
  UserListMyParticipantProjectsQuery,
  UserListOwnCoursesGQL,
} from "../../generated/graphql";
import { UserService } from "../shared/auth/user.service";

@Component({
  templateUrl: "./my-list-courses-overview.component.html",
})
export class MyListCoursesOverviewComponent {
  constructor(
    private _mutListMyParticipantProjects: UserListMyParticipantProjectsGQL,
    private _mutListOwnCourses: UserListOwnCoursesGQL,
    private _userService: UserService
  ) {}
  //TODO: Markus - So okay ?
  readonly courses$ = this._mutListMyParticipantProjects
    .fetch(
      {},
      { notifyOnNetworkStatusChange: true, fetchPolicy: "network-only" }
    )
    .pipe(
      //TODO: Marcus geht das sauberer
      map((res) => {
        let returnValue: UserListMyParticipantProjectsQuery["projects"]["nodes"] =
          res.data.projects.nodes;
        return returnValue;
      })
    );

  readonly ownCourses$ = this._mutListOwnCourses
    .fetch(
      {},
      { notifyOnNetworkStatusChange: true, fetchPolicy: "network-only" }
    )
    .pipe(pluck("data", "projects", "nodes"));

  readonly currentUserId$ = this._userService.userId$;

  readonly combinedCourses$ = combineLatest([
    this.currentUserId$,
    this.courses$,
  ]).pipe(
    map(([id, courses]) =>
      courses.map((course) => ({
        ...course,
        hasAccepted: course.projectMembers.some(
          (member) => member.userId == id
        ),
      }))
    ),
    tap(console.log)
  );
}
