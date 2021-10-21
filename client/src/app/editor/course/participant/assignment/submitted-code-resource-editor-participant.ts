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

interface urlIdEntry {
  assignmentId: string;
  resourceId: string;
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

  urlIds$: Observable<urlIdEntry> = this._activatedRoute.paramMap.pipe(
    map((params) => ({
      assignmentId: params.get("assignmentId")?.toString(),
      resourceId: params.get("resourceId")?.toString(),
    })),
    tap(console.log)
  );

  // resourceId$: Observable<String> = this._activatedRoute.paramMap.pipe(
  //   map((param) => param.get("resourceId")),
  //   tap(console.log)
  // );

  readonly submittedCodeResource$: Observable<SubmittedCodeResourceEntry> =
    combineLatest([this.urlIds$, this._courseService.fullCourseData$]).pipe(
      map(([urlIds, course]) => {
        console.log("URL changed");
        console.log("assignment");
        console.log(urlIds.assignmentId);
        console.log(urlIds.resourceId);
        const assignment = course.basedOnProject.assignments.find(
          (assignment) => assignment.id == urlIds.assignmentId
        );
        const submission = course.assignmentSubmissions.find(
          (a) => a.assignment.id === urlIds.assignmentId
        );

        const requiredCodeResource =
          submission.assignmentSubmittedCodeResources.find(
            (submitted) =>
              submitted.codeResource.id === urlIds.resourceId.toString()
          ).assignmentRequiredCodeResource;

        const toReturn: SubmittedCodeResourceEntry = {
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          assignmentDescription: assignment.description,
          assignmentName: assignment.name,
          requiredCodeResourceDescription:
            assignment.assignmentRequiredCodeResources.find(
              (required) => required.id === requiredCodeResource.id
            ).description,
          codeResourceId: urlIds.resourceId.toString(),
        };
        return toReturn;
      })
    );

  readonly assignment$ = combineLatest([
    this._courseService.fullCourseData$,
    this.urlIds$,
  ]).pipe(
    map(([course, ids]) =>
      course.basedOnProject.assignments.find(
        (assignment) => assignment.id == ids.assignmentId
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
