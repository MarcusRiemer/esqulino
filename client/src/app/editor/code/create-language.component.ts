import { Component } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import {
  CreateProgrammingLanguageGQL,
  CreateProgrammingLanguageMutation,
} from "../../../generated/graphql";

import { CodeResource, CodeResourceDescription } from "../../shared";

import { ProjectService } from "../project.service";

@Component({
  selector: "create-language",
  templateUrl: "./templates/create-language.html",
  styleUrls: ["./create-language.component.scss"],
})
export class CreateLanguageComponent {
  readonly minLengthDisplayName = 2;
  readonly minLengthTechnicalName = 1;

  creationInput = new UntypedFormGroup({
    newLanguageDisplayName: new UntypedFormControl("", {
      validators: [
        Validators.required,
        Validators.minLength(this.minLengthDisplayName),
      ],
    }),
    newLanguageTechnicalName: new UntypedFormControl("", {
      validators: [Validators.minLength(this.minLengthTechnicalName)],
    }),
    runtimeLanguage: new UntypedFormControl("generic", {
      validators: [Validators.required],
      updateOn: "blur",
    }),
    createMetaBlockLanguage: new UntypedFormControl(true),
    createStructureAndSyntaxGrammar: new UntypedFormControl(false),
  });

  inProgress = false;

  constructor(
    private _serverEndpoint: CreateProgrammingLanguageGQL,
    private _projectService: ProjectService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {}

  async submit() {
    try {
      // Don't let hasty users click multiple times
      this.creationInput.disable();

      // Ask the server to do it's job
      const result = await this._serverEndpoint
        .mutate({
          projectId: this.currentProjectId,
          languageDisplayName: this.newLanguageDisplayName.value,
          languageTechnicalName: this.newLanguageTechnicalName.value,
          runtimeLanguageId: this.runtimeLanguage.value,
          createInitialCodeResource: true,
          createStructureAndSyntaxGrammar:
            this.createStructureAndSyntaxGrammar.value,
          createMetaBlockLanguage: this.createMetaBlockLanguage.value,
        })
        .pipe(first())
        .toPromise();

      // Add the new resources to this project
      if (result.errors?.length > 0) {
        console.error(result.errors);
      }

      const resultData = result.data.createProgrammingLanguage;
      const p = this._projectService.cachedProject;

      const funcAddCodeResource = (desc: CodeResourceDescription) => {
        if (desc) {
          p.addCodeResource(new CodeResource(desc, p.resourceReferences));
        }
      };

      // Add every code resource that might exist in the answer
      funcAddCodeResource(resultData.structureGrammarCodeResource);
      funcAddCodeResource(resultData.syntaxGrammarCodeResource);
      funcAddCodeResource(resultData.initialCodeResource);
      funcAddCodeResource(resultData.createdBlockLanguageCodeResource);

      this._router.navigate([resultData.structureGrammarCodeResource.id], {
        relativeTo: this._route.parent,
      });
    } finally {
      this.creationInput.enable();
    }
  }

  private get currentProjectId() {
    return this._projectService.cachedProject.id;
  }

  get newLanguageDisplayName() {
    return this.creationInput.get("newLanguageDisplayName");
  }

  get newLanguageTechnicalName() {
    return this.creationInput.get("newLanguageTechnicalName");
  }

  get runtimeLanguage() {
    return this.creationInput.get("runtimeLanguage");
  }

  get createMetaBlockLanguage() {
    return this.creationInput.get("createMetaBlockLanguage");
  }

  get createStructureAndSyntaxGrammar() {
    return this.creationInput.get("createStructureAndSyntaxGrammar");
  }
}
