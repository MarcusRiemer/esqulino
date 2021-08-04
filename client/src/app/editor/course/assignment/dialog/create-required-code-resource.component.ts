import { WHITE_ON_BLACK_CSS_CLASS } from "@angular/cdk/a11y/high-contrast-mode/high-contrast-mode-detector";
import { Time } from "@angular/common";
import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first, map } from "rxjs/operators";
import { PerformDataService } from "src/app/shared/authorisation/perform-data.service";
import { LanguageService } from "src/app/shared/language.service";
import {
  CreateAssignmentGQL,
  CreateAssignmentRequiredCodeResourceGQL,
  CreateAssignmentRequiredTemplateGQL,
  CreateAssignmentRequiredTemplateInput,
  ReferenceTypeEnum,
} from "src/generated/graphql";
import { CourseService } from "../../course.service";

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
export class CreateRequiredCodeResourceComponent implements OnInit {
  @Input() type: ReferenceTypeEnum;

  //TODO: refactor ?
  ngOnChanges(changes: SimpleChanges) {
    this.requiredCodeResource.referenceType = changes.type.currentValue;
  }

  constructor(
    private readonly _courseService: CourseService,
    private readonly _mutCreateRequiredCodeResource: CreateAssignmentRequiredCodeResourceGQL,
    private readonly _mutCreateRequiredTemplate: CreateAssignmentRequiredTemplateGQL,
    private readonly _router: Router,
    private readonly _languageService: LanguageService,
    private readonly _activatedRoute: ActivatedRoute
  ) {}

  availableProgrammingLanguages = this._languageService.availableLanguages;

  availableBlockLanguages$ = this._courseService.fullCourseData$.pipe(
    map((course) => course.blockLanguages)
  );

  requiredCodeResource: CreateRequiredCodeResourceMutationVariables =
    {} as CreateRequiredCodeResourceMutationVariables;

  assignmentId$ = this._activatedRoute.paramMap.pipe(
    map((param) => param.get("assignmentId"))
  );

  ngOnInit(): void {
    this.assignmentId$.subscribe(
      (id) => (this.requiredCodeResource.assignmentId = id)
    );
    console.log(this.availableProgrammingLanguages);
  }

  async createRequirement() {
    if (this.requiredCodeResource.referenceType === undefined) {
      await this._mutCreateRequiredCodeResource
        .mutate(this.requiredCodeResource)
        .pipe(first())
        .toPromise();
    } else {
      await this._mutCreateRequiredTemplate
        .mutate(this.requiredCodeResource)
        .pipe(first())
        .toPromise();
    }
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
