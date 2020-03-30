import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";

import {
  ProjectDescription,
  ProjectListDescription,
} from "../project.description";

import { ServerApiService } from "./serverapi.service";
import { DataService } from "./data-service";

/**
 * Convenient and cached access to server side project descriptions.
 */
@Injectable()
export class ProjectDataService extends DataService<
  ProjectListDescription,
  ProjectDescription
> {
  public constructor(
    private _serverApi: ServerApiService,
    snackBar: MatSnackBar,
    http: HttpClient
  ) {
    super(http, snackBar, _serverApi.getProjectListUrl(), "Project");
  }

  protected resolveIndividualUrl(id: string): string {
    return this._serverApi.getProjectUrl(id);
  }
}
