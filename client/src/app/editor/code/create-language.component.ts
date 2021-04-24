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
  creationInput = new FormGroup({
    newLanguageName: new FormControl("", {
      validators: [Validators.required, Validators.minLength(2)],
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
          languageName: this.newLanguageName.value,
          runtimeLanguageId: this.runtimeLanguage.value,
          createInitialCodeResource: true,
        })
        .pipe(first())
        .toPromise();

      // Add the new resources to this project
      const resultData = result.data.createProgrammingLanguage;
      const p = this._projectService.cachedProject;

      // Always present: A new programming language link

      // Always present: The new grammar code resource
      p.addCodeResource(
        new CodeResource(resultData.grammarCodeResource, p.resourceReferences)
      );

      if (resultData.initialCodeResource) {
        p.addCodeResource(
          new CodeResource(resultData.initialCodeResource, p.resourceReferences)
        );
      }

      this._router.navigate([resultData.grammarCodeResource.id], {
        relativeTo: this._route.parent,
      });
    } finally {
      this.creationInput.enable();
    }
  }

  private get currentProjectId() {
    return this._projectService.cachedProject.id;
  }

  get newLanguageName() {
    return this.creationInput.get("newLanguageName");
  }

  get runtimeLanguage() {
    return this.creationInput.get("runtimeLanguage");
  }
}
