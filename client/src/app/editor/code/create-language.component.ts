import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import { CreateProgrammingLanguageGQL } from "../../../generated/graphql";

import { CodeResource } from "../../shared";

import { ProjectService } from "../project.service";

@Component({
  selector: "create-language",
  templateUrl: "./templates/create-language.html",
})
export class CreateLanguageComponent {
  readonly minLengthDisplayName = 2;
  readonly minLengthTechnicalName = 1;

  creationInput = new FormGroup({
    newLanguageDisplayName: new FormControl("", {
      validators: [
        Validators.required,
        Validators.minLength(this.minLengthDisplayName),
      ],
    }),
    newLanguageTechnicalName: new FormControl("", {
      validators: [Validators.minLength(this.minLengthTechnicalName)],
    }),
    runtimeLanguage: new FormControl("generic", {
      validators: [Validators.required],
      updateOn: "blur",
    }),
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
        })
        .pipe(first())
        .toPromise();

      // Add the new resources to this project
      const resultData = result.data.createProgrammingLanguage;
      const p = this._projectService.cachedProject;

      // Always present: The new grammar code resource
      p.addCodeResource(
        new CodeResource(
          resultData.structureGrammarCodeResource,
          p.resourceReferences
        )
      );

      if (resultData.initialCodeResource) {
        p.addCodeResource(
          new CodeResource(resultData.initialCodeResource, p.resourceReferences)
        );
      }

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
}
