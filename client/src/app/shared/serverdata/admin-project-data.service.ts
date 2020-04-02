import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { ProjectListDescription } from "../project.description";

import { ServerApiService } from "./serverapi.service";
import { ListData } from "./list-data";

/**
 * Convenient and cached access to server side project descriptions.
 */
@Injectable()
export class AdminListProjectDataService extends ListData<
  ProjectListDescription
> {
  public constructor(serverApi: ServerApiService, http: HttpClient) {
    super(http, serverApi.getAdminProjectListUrl());
  }
}
