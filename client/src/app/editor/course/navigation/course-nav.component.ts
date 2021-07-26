import { Component } from "@angular/core";
import { concat, forkJoin, from } from "rxjs";
import {
  filter,
  first,
  map,
  distinctUntilChanged,
  concatMap,
  switchMap,
  toArray,
} from "rxjs/operators";

import { FullProjectGQL } from "../../../../generated/graphql";
import { ProjectService } from "../../project.service";

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

  readonly courseData$ = this._fullProject
    .watch({ id: this._projectService.cachedProject.id })
    .valueChanges.pipe(map((project) => project.data.project));

  toSideNavStructure(id, name, assignmentRequiredCodeResources) {
    return {
      id,
      name,
      solutions: assignmentRequiredCodeResources.map(
        ({ solution }) => solution?.id
      ),
      templates: assignmentRequiredCodeResources.map(({ template }) => {
        return {
          id: template?.codeResource?.id,
          reference_type: template?.referenceType,
        };
      }),
    };
  }

  assignments$ = this.courseData$.pipe(
    distinctUntilChanged(),
    switchMap(({ assignments }) =>
      from(assignments).pipe(
        map((e) =>
          this.toSideNavStructure(
            e.id,
            e.name,
            e.assignmentRequiredCodeResources
          )
        ),
        concatMap((assignment) =>
          this.resolveSolutions(assignment.solutions).pipe(
            map((solutionCodeResource) => ({
              ...assignment,
              solutions: solutionCodeResource,
            }))
          )
        ),
        // for templates
        concatMap((assignment) =>
          this.resolveTemplates(assignment.templates).pipe(
            map((templates) => ({ ...assignment, templates }))
          )
        ),
        toArray()
      )
    )
  );

  readonly codeResource$ = this.courseData$.pipe(map((p) => p.codeResources));

  resolveSolutions(ids: string[]) {
    console.log(ids);
    const solutions = from(ids).pipe(
      concatMap((id) =>
        this.getCodeResourcesOfProject(id).pipe(filter((e) => !!e))
      ),
      toArray()
    );
    return solutions; //array von Observable<string>[] -> ein Observable<string[]> -> muss fertig sein!
  }

  resolveTemplates(templates: { id: string; reference_type: string }[]) {
    const solutions = from(templates).pipe(
      concatMap((template) =>
        this.getCodeResourcesOfProject(template.id).pipe(
          map((code_resource) => ({
            reference_type: template.reference_type,
            code_resource,
          }))
        )
      ),
      filter((v) => !!v?.reference_type),
      toArray() // macht ein Array => Observable<string> => Observable<string []>
    );

    return solutions;
  }

  getCodeResourcesOfProject(id: string) {
    // -> Das await macht den Promis weg
    return this.codeResource$ //Observabl<CodeResource[]]
      .pipe(
        first(),
        map((e) => e.find((c) => c.id == id))
      ); //Observabl<CodeResource>;
  }
}
