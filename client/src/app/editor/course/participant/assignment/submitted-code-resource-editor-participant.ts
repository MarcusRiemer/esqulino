import { Component } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { combineLatest, Observable } from "rxjs";
import {
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
  tap,
} from "rxjs/operators";

//import * as GraphQL from "../../../../../generated/graphql";
import { CodeResource } from "../../../../shared";
import { BlockLanguage } from "../../../../shared/block";
import { ProjectService } from "../../../../editor/project.service";
import { CourseService } from "../../course.service";

// TODO: All of these properties are navigational data, they can be
//       expressed as observable properties.
interface SubmittedCodeResourceEntry {
  codeResourceId: string;
  startDate: string;
  endDate: string;
  assignmentName: string;
  assignmentDescription: string;
  requiredCodeResourceDescription?: string;
}

@Component({
  templateUrl: "./submitted-code-resource-editor-participant.component.html",
})
export class SubmittedCodeResourceEditorParticipantComponente {
  constructor(
    private readonly _projectService: ProjectService,
    private readonly _courseService: CourseService,
    private readonly _activatedRoute: ActivatedRoute
  ) {}

  readonly submittedCodeResource$: Observable<SubmittedCodeResourceEntry> =
    this._activatedRoute.params.pipe(
      switchMap((param: Params) =>
        this._courseService.fullCourseData$.pipe(
          map((course) => {
            console.log("URL changed");
            const assignment = course.basedOnProject.assignments.find(
              (assignment) => assignment.id == param["assignmentId"]
            );
            const submission = course.assignmentSubmissions.find(
              (a) => a.assignment.id === param["assignmentId"]
            );
            const requiredCodeResource =
              submission.assignmentSubmittedCodeResources.find(
                (submitted) => submitted.codeResource.id === param["resourceId"]
              ).assignmentRequiredCodeResource;
            console.log(requiredCodeResource);
            console.log(assignment.assignmentRequiredCodeResources);

            const toReturn: SubmittedCodeResourceEntry = {
              startDate: assignment.startDate,
              endDate: assignment.endDate,
              assignmentDescription: assignment.description,
              assignmentName: assignment.name,
              requiredCodeResourceDescription:
                assignment.assignmentRequiredCodeResources.find(
                  (required) => required.id === requiredCodeResource.id
                ).description,
              codeResourceId: param["resourceId"],
            };
            return toReturn;
          }),
          tap(console.log)
        )
      )
    );

  readonly paramCodeResourceId$ = this._activatedRoute.params.pipe(
    map((p) => p["resourceId"]),
    distinctUntilChanged()
  );

  readonly paramAssignmentId$ = this._activatedRoute.params.pipe(
    map((p) => p["assignmentId"]),
    distinctUntilChanged()
  );

  readonly assignment$ = combineLatest([
    this._courseService.fullCourseData$,
    this.paramAssignmentId$,
  ]).pipe(
    map(([course, id]) =>
      course.basedOnProject.assignments.find(
        (assignment) => assignment.id == id
      )
    )
  );

  readonly currentCodeResource$: Observable<CodeResource> = combineLatest([
    this._projectService.activeProject,
    this.submittedCodeResource$,
  ]).pipe(map(([p, current]) => p.getCodeResourceById(current.codeResourceId)));

  readonly currentBlockLanguage$: Observable<BlockLanguage> =
    this.currentCodeResource$.pipe(switchMap((c) => c.blockLanguage$));

  // Probably not required
  readonly renderDataReady$ = combineLatest([
    this.assignment$,
    this.currentCodeResource$,
    this.currentBlockLanguage$,
  ]).pipe(map((renderData) => renderData.every((d) => !!d), startWith(false)));

  //TODO:
  //this.submittedCodeResource$ = this._activatedRoute.params.pipe(map())
}
