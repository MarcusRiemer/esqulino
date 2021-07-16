import { Component } from "@angular/core";
import { map } from "rxjs/operators";

import { FullProjectGQL } from "../../../generated/graphql";
import { ProjectService } from "../project.service";

@Component({
  selector: "course-nav",
  templateUrl: "./course-nav.component.html",
  styleUrls: ["./course-nav.component.scss"],
})
export class CourseNavComponent {
  // TODO: Diese felder auslagern in einen Service
  constructor(
    private readonly _projectService: ProjectService,
    private readonly _fullProject: FullProjectGQL
  ) {}

  readonly courseData$ = this._fullProject
    .watch({ id: this._projectService.cachedProject.id })
    .valueChanges.pipe(map((project) => project.data.project));

  readonly assignments$ = this.courseData$.pipe(map((p) => p.assignments));
}
