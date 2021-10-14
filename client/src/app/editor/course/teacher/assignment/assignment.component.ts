import { DatePipe, formatDate } from "@angular/common";
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { filter, find, first, map, mergeMap, tap } from "rxjs/operators";
import { PerformDataService } from "src/app/shared/authorisation/perform-data.service";
import {
  DestroyAssignmentRequiredCodeResourceGQL,
  ReferenceTypeEnum,
  RemoveAssignmentRequiredSolutionGQL,
  UpdateAssignmentGQL,
} from "src/generated/graphql";
import { ToolbarService } from "../../../../shared";
import { MessageDialogComponent } from "../../../../shared/message-dialog.component";
import { ProjectService } from "../../../project.service";
import { SidebarService } from "../../../sidebar.service";
import { EditorToolbarService } from "../../../toolbar.service";
import { CourseService } from "../../course.service";
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
export class AssignmentComponent implements OnInit, OnDestroy {
  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _courseService: CourseService,
    private readonly _mutDestroyRequirement: DestroyAssignmentRequiredCodeResourceGQL,
    private readonly _mutUpdateAssignment: UpdateAssignmentGQL,
    private readonly _performData: PerformDataService,
    private readonly _matDialog: MatDialog,
    private readonly _removeAssignmentSolution: RemoveAssignmentRequiredSolutionGQL,
    private _router: Router,
    private _projectService: ProjectService,
    private _toolbarService: EditorToolbarService,
    private _sidebarService: SidebarService,
    @Inject(LOCALE_ID) private _locale: string
  ) {}

  private _subscriptionRefs: Subscription[] = [];

  assignmentId$ = this._activatedRoute.paramMap.pipe(
    map((param) => param.get("assignmentId"))
  );
  assignment: AssignmentEntry;
  currentType: ReferenceTypeEnum = "given_full";

  /**
   * These permissions are required to add a member
   *
   * not in use
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

  /**
   * These permissions are required to remove the solution
   */
  readonly removeAssignmentRequiredSolutionPermission$ =
    this._courseService.activeCourse$.pipe(
      map((p) =>
        this._performData.project.removeAssignmentRequiredSolution(p.id)
      )
    );

  /**
   * @return A peek at the project of the currently edited resource
   */
  get peekProject() {
    return this._projectService.cachedProject;
  }

  //TODO: refactor wie in assingment für participants
  ngOnInit(): void {
    // Ensure sane default state
    this._sidebarService.hideSidebar();
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = true;

    const btnCreate = this._toolbarService.addButton(
      "create",
      "Files anlegen",
      "files-o",
      undefined,
      this._performData.project.updateAssignment(this.peekProject.id)
    );
    const refClone = btnCreate.onClick.subscribe((_) => {
      this._router.navigate([this._router.url, "create", "file"], {
        queryParams: { referenceType: "" },
      });
    });

    //updateAssignmentPermission$ | async
    const refSafe = this._toolbarService.saveItem.onClick.subscribe((_) => {
      this.saveAssingment();
    });

    this._subscriptionRefs.push(
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
          tap((e) => console.log("asdasd-----------")),
          mergeMap((e) => e),
          tap(console.log)
        )
        .subscribe((e) => (this.assignment = e))
    );

    this._subscriptionRefs.push(refClone, refSafe);
  }

  /**
   * Cleans up all acquired references
   */
  ngOnDestroy() {
    this._subscriptionRefs.forEach((ref) => ref.unsubscribe());
    this._subscriptionRefs = [];
  }

  async onRemoveSolution(assignmentRequiredCodeResourceId: string) {
    const confirmed = await MessageDialogComponent.confirm(this._matDialog, {
      description: $localize`:@@message.ask-delete-resource: Soll diese Musterlösung wirklich entfernt werden?`,
    });

    if (confirmed) {
      this._removeAssignmentSolution
        .mutate({ assignmentRequiredCodeResourceId })
        .pipe(first())
        .toPromise();
    }
  }

  async deleteFile(assignmentId: string) {
    const confirmed = await MessageDialogComponent.confirm(this._matDialog, {
      description: $localize`:@@message.ask-delete-resource:Soll diese Resource wirklich gelöscht werden?`,
    });

    if (confirmed) {
      await this._mutDestroyRequirement
        .mutate({
          id: assignmentId,
        })
        .pipe(first())
        .toPromise();
    }
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
    "name",
    "type",
    "solution",
    "status",
    "actions",
  ];
}
