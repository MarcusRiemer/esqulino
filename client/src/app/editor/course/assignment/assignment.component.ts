import { DatePipe, formatDate } from "@angular/common";
import { Component, Inject, LOCALE_ID, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { filter, find, first, map, mergeMap, tap } from "rxjs/operators";
import { PerformDataService } from "src/app/shared/authorisation/perform-data.service";
import {
  AssignmentTemplateCodeResource,
  DestroyAssignmentRequiredCodeResourceGQL,
  MutationDestroyAssignmentRequiredCodeResourceArgs,
  ReferenceTypeEnum,
  UpdateAssignmentGQL,
} from "src/generated/graphql";
import { CourseService } from "../course.service";
import { ChangeRequiredCodeResourceDialogComponent } from "./dialog/change-required-code-resource-dialog.component";
import { CreateRequiredCodeResourceSolutionComponent } from "./dialog/create-required-code-resource-solution.component";

//TODO: Geht das hier besser, oder ist das ligitim
interface AssignmentEntry {
  id: string;
  name: string;
  description: string;
  weight: number;
  startDate: string;
  changedStartDate: string;
  changedStartTime: string;
  endDate: string;
  changedEndDate: string;
  changedEndTime: string;
  requirements: {
    id: string;
    name: string;
    description: string;
    programmingLanguageId: string;
    solution: {
      name: string;
      id: string;
    };
    referenceType: ReferenceTypeEnum;
  }[];
}

@Component({
  selector: "app-assignment",
  templateUrl: "./assignment.component.html",
})
export class AssignmentComponent implements OnInit {
  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _courseService: CourseService,
    private readonly _mutDestroyRequirement: DestroyAssignmentRequiredCodeResourceGQL,
    private readonly _mutUpdateAssignment: UpdateAssignmentGQL,
    private readonly _performData: PerformDataService,
    private readonly _matDialog: MatDialog,
    @Inject(LOCALE_ID) private _locale: string
  ) {}
  assignmentId$ = this._activatedRoute.paramMap.pipe(
    map((param) => param.get("assignmentId"))
  );
  assignment: AssignmentEntry;
  currentType: ReferenceTypeEnum = "given_full";

  /**
   * These permissions are required to add a member
   */
  readonly updateAssignmentPermission$ = this._courseService.activeCourse$.pipe(
    map((p) => this._performData.project.updateAssignment(p.id))
  );

  /**
   * These permissions are required to add a member
   */
  readonly createRequirementPermission$ =
    this._courseService.activeCourse$.pipe(
      map((p) => this._performData.project.createAssignmentRequirements(p.id))
    );

  /**
   * These permissions are required to add a member
   */
  readonly updateRequirementPermission$ =
    this._courseService.activeCourse$.pipe(
      map((p) => this._performData.project.updateAssignmentRequirements(p.id))
    );

  /**
   * These permissions are required to add a member
   */
  readonly deleteRequirementPermission$ =
    this._courseService.activeCourse$.pipe(
      map((p) => this._performData.project.deleteAssignmentRequirement(p.id))
    );

  ngOnInit(): void {
    this.assignmentId$
      .pipe(
        map((assignmentId) =>
          this._courseService.fullCourseData$.pipe(
            map((fullData) => {
              const toReturn: AssignmentEntry = fullData.assignments
                .map((a) => {
                  //TODO: maybe refactor ? the dates ?
                  const navData = {
                    id: a.id,
                    name: a.name,
                    description: a.description,
                    weight: a.weight,
                    startDate: a.startDate,
                    changedStartDate: a.startDate
                      ? formatDate(a.startDate, "yyyy-MM-dd", this._locale)
                      : undefined,
                    changedStartTime: a.startDate
                      ? formatDate(
                          a.startDate,
                          "HH:mm",
                          this._locale,
                          "GMT+02:00"
                        )
                      : undefined,
                    endDate: a.endDate,
                    changedEndDate: a.endDate
                      ? formatDate(a.endDate, "yyyy-MM-dd", this._locale)
                      : undefined,
                    changedEndTime: a.endDate
                      ? formatDate(a.endDate, "HH:mm", this._locale)
                      : undefined,
                    requirements: [
                      ...a.assignmentRequiredCodeResources.map((req) => ({
                        id: req.id,
                        name: req.name,
                        description: req.description,
                        programmingLanguageId: req.programmingLanguageId,
                        solution: {
                          ...fullData.codeResources.find(
                            (res) => res.id === req?.solution?.id
                          ),
                        },
                        referenceType: req?.template?.referenceType,
                      })),
                    ],
                  };

                  return navData;
                })
                .find((e) => e.id == assignmentId);

              return toReturn;
            })
          )
        ),
        mergeMap((e) => e),
        tap(console.log)
      )
      .subscribe((e) => (this.assignment = e));
  }

  async deleteFile(assignmentId: string) {
    await this._mutDestroyRequirement
      .mutate({
        id: assignmentId,
      })
      .pipe(first())
      .toPromise();
  }

  async saveAssingment() {
    const tempStartDate = this.mergeDateAndTime(
      this.assignment.changedStartDate,
      this.assignment.changedStartTime
    );
    const tempEndDate = this.mergeDateAndTime(
      this.assignment.changedEndDate,
      this.assignment.changedEndTime
    );

    await this._mutUpdateAssignment
      .mutate({
        ...this.assignment,
        startDate: tempStartDate,
        endDate: tempEndDate,
      })
      .pipe(first())
      .toPromise();
  }

  //TODO: refactore and merge with the function in the create assingment
  mergeDateAndTime(date: string, time: string): string {
    let toReturn: Date = date ? new Date(date) : undefined;
    if (!!date) {
      if (!!time) {
        let temp = time.split(":");
        toReturn.setHours(+temp[0], +temp[1]);
      } else {
        toReturn.setHours(0, 0);
      }
    }
    return toReturn?.toISOString();
  }

  async createSolution(requiredId: string) {
    this._matDialog.open(CreateRequiredCodeResourceSolutionComponent, {
      data: {
        requiredId: requiredId,
        programmingLanguageId: this.assignment.requirements.find(
          (req) => req.id == requiredId
        ).programmingLanguageId,
      },
    });
  }

  updateRequirement(
    requirementId: string,
    requirementName: string,
    requirementDescription: string
  ) {
    this._matDialog.open(ChangeRequiredCodeResourceDialogComponent, {
      data: {
        requirementId: requirementId,
        requirementName: requirementName,
        requirementDescription: requirementDescription,
      },
    });
  }

  displayedColumns: string[] = [
    "actions",
    "name",
    "type",
    "solution",
    "status",
  ];
}
