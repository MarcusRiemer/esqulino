import { Injectable } from "@angular/core";

import { BehaviorSubject, Observable } from "rxjs";

import { ProjectService } from "../project.service";
import {
  AssignmentTemplateCodeResource,
  FullProjectGQL,
  Project,
} from "src/generated/graphql";
import { map } from "rxjs/operators";

export interface AssignmentEntry {
  id: string;
  name: string;
  templates: {
    name: string;
    id: string;
    reference_type: AssignmentTemplateCodeResource["referenceType"];
  }[];
  solutions: {
    name: string;
    id: string;
  }[];
}

@Injectable()
export class CourseService {
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

  readonly fullAssignment$: Observable<AssignmentEntry[]> =
    this.fullCourseData$.pipe(
      map((fullData) => {
        const toReturn: AssignmentEntry[] = fullData.assignments.map((a) => {
          const navData = {
            id: a.id,
            name: a.name,
            solutions: a.assignmentRequiredCodeResources
              .filter((req) => req.solution)
              .map((req) =>
                fullData.codeResources.find((res) => res.id === req.solution.id)
              ), // TODO: refactor
            templates: a.assignmentRequiredCodeResources
              .filter((req) => req.template)
              .map((req) => ({
                ...fullData.codeResources.find(
                  (res) => res.id === req.template.codeResource.id
                ),
                reference_type: req.template.referenceType,
              })),
          };

          return navData;
        });

        return toReturn;
      })
    );

  readonly courseId$ = this._projectService.activeProjectId$;

  readonly activeCourse$ = this._projectService.activeProject;
}
