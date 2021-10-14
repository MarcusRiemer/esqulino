import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { async } from "@angular/core/testing";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { first, map, tap } from "rxjs/operators";
import { LanguageService } from "src/app/shared/language.service";
import {
  CreateAssignmentRequiredCodeResourceGQL,
  CreateAssignmentRequiredTemplateGQL,
  CreateAssignmentRequiredTemplateFromGQL,
  ReferenceTypeEnum,
} from "src/generated/graphql";
import { SidebarService } from "../../../../sidebar.service";
import { EditorToolbarService } from "../../../../toolbar.service";
import { CourseService } from "../../../course.service";

interface CreateRequiredCodeResourceMutationVariables {
  assignmentId: string;
  name: string;
  programmingLanguageId: string;
  description: string;
  referenceType: ReferenceTypeEnum;
  blockLanguageId: string;
}

@Component({
  selector: "app-create-required-code-resource",
  templateUrl: "./create-required-code-resource.component.html",
})
export class CreateRequiredCodeResourceComponent implements OnInit, OnDestroy {
  constructor(
    private readonly _courseService: CourseService,
    private readonly _mutCreateRequiredCodeResource: CreateAssignmentRequiredCodeResourceGQL,
    private readonly _mutCreateRequiredTemplate: CreateAssignmentRequiredTemplateGQL,
    private readonly _router: Router,
    private readonly _languageService: LanguageService,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _mutCreateTemplateFrom: CreateAssignmentRequiredTemplateFromGQL,
    private readonly _fromBuilder: FormBuilder,
    private _toolbarService: EditorToolbarService,
    private _sidebarService: SidebarService
  ) {}

  referenceType$ = this._activatedRoute.queryParamMap.pipe(
    tap(console.log),
    map((param) => param.get("referenceType"))
  );

  availableCodeResources$ = this._courseService.fullCourseData$.pipe(
    map((course) => course.codeResources)
  );

  availableProgrammingLanguages = this._languageService.availableLanguages;

  availableBlockLanguages$ = this._courseService.fullCourseData$.pipe(
    map((course) => course.blockLanguages)
  );

  requiredCodeResource: CreateRequiredCodeResourceMutationVariables =
    {} as CreateRequiredCodeResourceMutationVariables;

  assignmentId$ = this._activatedRoute.paramMap.pipe(
    map((param) => param.get("assignmentId"))
  );

  createRequiredForm: FormGroup;

  private _subscriptionRefs: Subscription[] = [];

  ngOnInit(): void {
    // Ensure sane default state
    this._sidebarService.hideSidebar();
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;

    this.createRequiredForm = this._fromBuilder.group({
      selectedProgrammingId: ["undefined"],
      selectedCodeResourceId: ["undefined"],
      selectedBlockLanguageId: ["undefined"],
      requiredName: [""],
      requiredDescription: [""],
      selectedCreateType: ["new-code-resource"],
    });

    this._subscriptionRefs.push(
      this.referenceType$.subscribe((reference) => {
        this.requiredCodeResource.referenceType = reference;
      })
    );

    this._subscriptionRefs.push(
      this.assignmentId$.subscribe(
        (id) => (this.requiredCodeResource.assignmentId = id)
      )
    );
  }

  /**
   * Cleans up all acquired references
   */
  ngOnDestroy() {
    this._subscriptionRefs.forEach((ref) => ref.unsubscribe());
    this._subscriptionRefs = [];
  }

  getDefaultTap(): number {
    switch (this.requiredCodeResource.referenceType) {
      case "given_full":
        return 2;
      case "given_partially":
        return 1;
      default:
        return 0;
    }
  }

  updateQueryParams(type: ReferenceTypeEnum): void {
    console.log("asds");
    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: { referenceType: type },
    });
  }

  async onCreateRequirement() {
    console.log(this.requiredCodeResource.referenceType);
    if (!this.requiredCodeResource.referenceType) {
      await this._mutCreateRequiredCodeResource
        .mutate({
          assignmentId: this.requiredCodeResource.assignmentId,
          name: this.createRequiredForm.get("requiredName").value,
          programmingLanguageId: this.createRequiredForm.get(
            "selectedProgrammingId"
          ).value,
          description: this.createRequiredForm.get("requiredDescription").value,
        })
        .pipe(first())
        .toPromise()
        .then((e) => this.navigateToAssignmentOverview());
    } else {
      switch (this.createRequiredForm.get("selectedCreateType").value) {
        case "new-code-resource":
          this._mutCreateRequiredTemplate
            .mutate({
              assignmentId: this.requiredCodeResource.assignmentId,
              name: this.createRequiredForm.get("requiredName").value,
              programmingLanguageId: this.createRequiredForm.get(
                "selectedProgrammingId"
              ).value,
              description: this.createRequiredForm.get("requiredDescription")
                .value,
              referenceType: this.requiredCodeResource.referenceType,
              blockLanguageId: this.createRequiredForm.get(
                "selectedBlockLanguageId"
              ).value,
            })
            .pipe(first())
            .toPromise()
            .then((e) => this.navigateToAssignmentOverview());
          break;
        case "copy-code-resource":
          this._mutCreateTemplateFrom
            .mutate({
              assignmentId: this.requiredCodeResource.assignmentId,
              codeResourceId: this.createRequiredForm.get(
                "selectedCodeResourceId"
              ).value,
              name: this.createRequiredForm.get("requiredName").value,
              description: this.createRequiredForm.get("requiredDescription")
                .value,
              referenceType: this.requiredCodeResource.referenceType,
              deepCopy: true,
            })
            .pipe(first())
            .toPromise()
            .then((e) => this.navigateToAssignmentOverview());
          break;
        case "reference-code-resource":
          this._mutCreateTemplateFrom
            .mutate({
              assignmentId: this.requiredCodeResource.assignmentId,
              codeResourceId: this.createRequiredForm.get(
                "selectedCodeResourceId"
              ).value,
              name: this.createRequiredForm.get("requiredName").value,
              description: this.createRequiredForm.get("requiredDescription")
                .value,
              referenceType: this.requiredCodeResource.referenceType,
              deepCopy: false,
            })
            .pipe(first())
            .toPromise()
            .then((e) => this.navigateToAssignmentOverview());
          break;
      }
    }
  }

  navigateToAssignmentOverview(): void {
    this._router.navigate(["../../"], { relativeTo: this._activatedRoute });
  }

  changeProgrammingLanguage(blockId: string) {
    this.requiredCodeResource.blockLanguageId = "undefined";
    this.availableBlockLanguages$ = this._courseService.fullCourseData$.pipe(
      map((course) =>
        course.blockLanguages.filter(
          (block) => block.defaultProgrammingLanguageId == blockId
        )
      )
    );
  }
}
