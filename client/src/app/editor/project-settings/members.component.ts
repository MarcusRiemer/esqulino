import { Component } from "@angular/core";
import { map, switchMap } from "rxjs/operators";

import { FullProjectGQL } from "../../../generated/graphql";

import { ProjectService } from "../project.service";

@Component({
  templateUrl: "templates/members.html",
  selector: "project-members",
})
export class MembersComponent {
  constructor(
    private readonly _projectService: ProjectService,
    private readonly _fullProjectQuery: FullProjectGQL
  ) {}

  private readonly _fullProject = this._projectService.activeProjectId$.pipe(
    switchMap((id) => this._fullProjectQuery.watch({ id }).valueChanges),
    map((fullProject) => fullProject.data.project)
  );

  readonly owner$ = this._fullProject.pipe(
    map((fullProject) => fullProject.user)
  );
}
