import { Component } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import {
  AssignmentTemplateCodeResource,
  FullProjectGQL,
} from "../../../../generated/graphql";
import { ProjectService } from "../../project.service";

interface CourseNavEntry {
  id: string;
  name: string;
  templates: {
    id: string;
    reference_type: AssignmentTemplateCodeResource["referenceType"];
  }[];
  solutions: {
    name: string;
  }[];
}

interface CourseNavEntryAlternative {
  id: string;
  name: string;
  references: (
    | {
        type: "template";
        id: string;
        name: string;
        reference_type: AssignmentTemplateCodeResource["referenceType"];
      }
    | {
        type: "solution";
        id: string;
        name: string;
      }
  )[];
}

interface CourseNavEntryAlternativeWithPick {
  id: string;
  name: string;
  references: (
    | ({ type: "template" } & Pick<
        AssignmentTemplateCodeResource,
        "id" | "referenceType"
      >)
    | {
        type: "solution";
        id: string;
        name: string;
      }
  )[];
}

@Component({
  selector: "course-nav",
  templateUrl: "./course-nav.component.html",
  styleUrls: ["./course-nav.component.scss"],
})
export class CourseNavComponent {
  _fullProject$: any;
  // TODO: Diese felder auslagern in einen Service
  constructor(
    private readonly _projectService: ProjectService,
    private readonly _fullProject: FullProjectGQL
  ) {}

  readonly fullCourseData$ = this._fullProject
    .watch({ id: this._projectService.cachedProject.id })
    .valueChanges.pipe(map((project) => project.data.project));

  readonly fullAssignments$ = this.fullCourseData$.pipe(
    map((data) => data.assignments)
  );

  assignments$: Observable<CourseNavEntry[]> = this.fullCourseData$.pipe(
    map((fullData) => {
      const toReturn: CourseNavEntry[] = fullData.assignments.map((a) => {
        const navData = {
          id: a.id,
          name: a.name,
          solutions: a.assignmentRequiredCodeResources
            .filter((req) => req.solution)
            .map((req) =>
              fullData.codeResources.find((res) => res.id === req.solution.id)
            ),
          templates: a.assignmentRequiredCodeResources
            .filter((req) => req.template)
            .map((req) => ({
              id: req.template.codeResource.id,
              reference_type: req.template.referenceType,
            })),
        };

        return navData;
      });

      return toReturn;
    })
  );
}
