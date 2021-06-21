import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";

import {
  ProjectCreationRequest,
  StringValidator,
} from "../shared/project.description";
import { MultiLangString } from "../shared/multilingual-string.description";
import { CreateProjectGQL } from "../../generated/graphql";
import { CurrentLocaleService } from "../current-locale.service";

@Component({
  templateUrl: "create-project.component.html",
})
export class CreateProjectComponent {
  private _currentError: string[] = [];
  private _requested$ = new BehaviorSubject<boolean>(false);
  public localizedName = "";
  /**
   * The definition that will be sent to the server.
   */
  public params: ProjectCreationRequest = {
    slug: undefined,
    name: undefined,
  };

  public constructor(
    private _createProjectGQL: CreateProjectGQL,
    private _router: Router,
    private readonly _locale: CurrentLocaleService
  ) {}

  // Defines how a valid slug could look like
  readonly regExpSlug = StringValidator.ProjectSlug;

  // Defines how a valid project name would look like
  readonly regExpName = StringValidator.ProjectName;

  get currentError() {
    return this._currentError;
  }

  get inProgress(): BehaviorSubject<boolean> {
    return this._requested$;
  }

  /**
   * Sends the current state of the the request to the server.
   */
  async createProject() {
    if (!this._requested$.getValue()) {
      this._requested$.next(true);

      const localizedName: MultiLangString = {};
      localizedName[this._locale.localeId] = this.localizedName;
      this.params.name = localizedName;
      try {
        const res = await this._createProjectGQL
          .mutate(this.params)
          .pipe(map((response) => response.data.createProject))
          .toPromise();
        this._currentError = res.errors;
        this._router.navigateByUrl(`/editor/${res.id}`);
        return res;
      } finally {
        this._requested$.next(false);
      }
    } else {
      throw new Error("Another creation request is in progress");
    }
  }
}
