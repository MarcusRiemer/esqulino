import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatest } from "rxjs";
import { first, map, pluck, switchMap, tap } from "rxjs/operators";
import Observable from "zen-observable";
import {
  JoinParticipantGroupGQL,
  UserListParticipantProjectsGQL,
} from "../../../generated/graphql";
import { UserService } from "../../shared/auth/user.service";

@Component({
  templateUrl: "./list-join-course-groups.html",
})
export class ListJoinCourseGroup {
  constructor(
    private readonly _userService: UserService,
    private readonly _activatedRouter: ActivatedRoute,
    private readonly _participantProjects: UserListParticipantProjectsGQL,
    private readonly _mutJoinParticipantGroup: JoinParticipantGroupGQL
  ) {}

  userId$ = this._userService.userId$;

  courseId$ = this._activatedRouter.paramMap.pipe(
    map((param) => param.get("courseId"))
  );

  //TODO: Marcus sollte ich hier lieber den Service verwenden ?
  //Wie gehe ich damit um, dass es jedes mal neu geladen werden soll

  readonly course$ = this.courseId$.pipe(
    switchMap((id) =>
      this._participantProjects
        .fetch(
          { id },
          { notifyOnNetworkStatusChange: true, fetchPolicy: "network-only" }
        )
        .pipe(pluck("data", "project"))
    )
  );

  readonly participantProjects$ = this.course$.pipe(
    pluck("participantProjects")
  );

  async onJoinParticipantGroup(groupId: string) {
    this._mutJoinParticipantGroup.mutate({ groupId }).pipe(first()).toPromise();
  }

  readonly displayedColumns = ["name", "memberNames", "groupSize", "actions"];

  //subscribtion = combineLatest([this.courseId$, this.participantCourseMember$]);
}
