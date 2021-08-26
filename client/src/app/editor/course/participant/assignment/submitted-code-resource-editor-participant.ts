import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { StringMappingType } from "typescript";

import { CourseService } from "../../course.service";

interface SubmittedCodeResourceEntry {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  assignmentName: string;
  assignmentDescription: string;
  requiredCodeResourceDescription?: string;
}

@Component({
  templateUrl: "./submitted-code-resource-editor-participant.component.html",
})
export class SubmittedCodeResourceEditorParticipantComponente
  implements OnInit
{
  constructor(
    private readonly _courseService: CourseService,
    private readonly _activatedRoute: ActivatedRoute
  ) {}

  submittedCodeResource$: Observable<SubmittedCodeResourceEntry>;

  //TODO:
  //this.submittedCodeResource$ = this._activatedRoute.params.pipe(map())

  ngOnInit(): void {
    this._activatedRoute.params.forEach(
      (param: Params) =>
        (this.submittedCodeResource$ = this._courseService.fullCourseData$.pipe(
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
              name: course.codeResources.find((resource) => param["resourceId"])
                .name,
              id: param["resourceId"],
            };
            return toReturn;
          }),
          tap(console.log)
        ))
    );
  }
}
