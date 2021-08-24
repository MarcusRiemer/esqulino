import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { map, pluck } from "rxjs/operators";

import {
  AssignmentTemplateCodeResource,
  FullProjectGQL,
} from "../../../../../generated/graphql";
import { ProjectService } from "../../../project.service";
import { CourseService } from "../../course.service";

interface CourseNavEntry {
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

/*
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
*/

@Component({
  selector: "course-nav",
  templateUrl: "./course-nav.component.html",
})
export class CourseNavComponent {
  constructor(private readonly _courseService: CourseService) {}

  assignments$: Observable<CourseNavEntry[]> =
    this._courseService.fullCourseData$.pipe(
      map((fullData) => {
        const toReturn: CourseNavEntry[] = fullData.assignments.map((a) => {
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
}
