import { Component } from "@angular/core";
import { Observable } from "rxjs";
import { filter, first, map, pluck, switchMap } from "rxjs/operators";

import {
  FullProjectGQL,
  FullProjectQuery,
  ProjectAddMemberGQL,
  ProjectAddMemberMutation,
} from "../../../generated/graphql";

import { ProjectService } from "../project.service";

interface ProjectMember {
  displayName: string;
  roleName: string;
  joinedAt: Date;
}

@Component({
  templateUrl: "templates/members.html",
  selector: "project-members",
})
export class MembersComponent {
  constructor(
    private readonly _projectService: ProjectService,
    private readonly _fullProjectQuery: FullProjectGQL,
    private readonly _mutAddMember: ProjectAddMemberGQL
  ) {}

  private readonly _fullProject$ = this._projectService.activeProjectId$.pipe(
    switchMap((id) => this._fullProjectQuery.watch({ id }).valueChanges),
    filter((response) => !response.loading),
    pluck("data", "project")
  );

  readonly owner$ = this._fullProject$.pipe(pluck("user"));

  readonly members$: Observable<ProjectMember[]> = this._fullProject$.pipe(
    pluck("projectMembers"),
    map((members) => {
      return members.map((singleMember) => ({
        displayName: singleMember.user.displayName,
        roleName: singleMember.membershipType,
        joinedAt: new Date(singleMember.joinedAt),
      }));
    })
  );

  async onAddMember() {
    const projectId = await this._projectService.activeProjectId$
      .pipe(first())
      .toPromise();

    const userIds = ["00000000-0000-0000-0000-000000000001"];

    await this._mutAddMember
      .mutate({
        projectId,
        isAdmin: true,
        userIds,
      })
      .pipe(first())
      .toPromise();

    console.log("Added members: ", userIds);
  }
}

//          Pull     | Push
//Single   call()    | Promise
//        -----------+-----------
//Multi    Iterator  | Observable
//
//
