import { areAllEquivalent } from "@angular/compiler/src/output/output_ast";
import { Component } from "@angular/core";
import { Observable } from "rxjs";
import { first, map, tap } from "rxjs/operators";
import { AssignmentTemplateCodeResource } from "../../../../../generated/graphql";
import { MultiLangString } from "../../../../shared/multilingual-string.description";
import { CourseService } from "../../course.service";

interface CourseNavEntry {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  graded: boolean;
  submittedCodeResources: {
    name: string;
    id: string;
    referenceType: AssignmentTemplateCodeResource["referenceType"];
  }[];
}

@Component({
  selector: "course-participant-nav",
  templateUrl: "./course-participant-nav.component.html",
})
export class CourseParticipantNavComponent {
  constructor(private readonly _courseService: CourseService) {}

  // assignments$: Observable<CourseNavParticipantEntry[]> =
  //   this._courseService.fullCourseData$.pipe(
  //     map((fullData) => {
  //       const toReturn: CourseNavParticipantEntry[] = {
  //         ...fullData.basedOnProject.assignments.map((a) => ({
  //           ...a,
  //           submitted_code_resources: fullData.assignmentSubmissions
  //             .filter((submission) => submission.assignment.id == a.id)
  //             .map((submission) => ({
  //               ...submission.assignmentSubmittedCodeResources.map(
  //                 (submitted) => ({
  //                   ...fullData.codeResources.find(
  //                     (res) => res.id === submitted.codeResource.id
  //                   ),
  //                   reference_type:
  //                     submitted.assignmentRequiredCodeResource?.template
  //                       ?.referenceType,
  //                 })
  //               ),
  //             })),
  //         })),
  //       };
  //       return toReturn;
  //     }),
  //     tap(console.log)
  //   );

  dateExceeded(date: Date) {
    const today = new Date();

    return today >= date;
  }

  assignments$: Observable<CourseNavEntry[]> =
    this._courseService.fullCourseData$.pipe(
      map((fullData) => {
        const toReturn: CourseNavEntry[] =
          fullData.basedOnProject.assignments?.map((a) => {
            const navData = {
              ...a,
              graded:
                fullData.assignmentSubmissions?.find(
                  (submission) => submission.assignment.id == a.id
                )?.assignmentSubmissionGradeParticipant !== undefined,
              submittedCodeResources: fullData?.assignmentSubmissions
                ?.find((submission) => submission?.assignment.id == a.id)
                ?.assignmentSubmittedCodeResources.map((submitted) => {
                  const codeResource =
                    submitted.assignmentRequiredCodeResource?.template
                      ?.referenceType == "given_full"
                      ? fullData.basedOnProject.codeResources.find(
                          (res) => res.id === submitted.codeResource.id
                        )
                      : fullData.codeResources.find(
                          (res) => res.id === submitted.codeResource.id
                        );

                  const toReturn = {
                    ...codeResource,
                    referenceType:
                      submitted.assignmentRequiredCodeResource?.template
                        ?.referenceType,
                  };
                  return toReturn;
                }),
            };
            return navData;
          });
        return toReturn;
      })
    );
}
