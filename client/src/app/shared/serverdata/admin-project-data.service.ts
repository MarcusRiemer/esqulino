import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { ProjectListDescription } from "../project.description";

import { ServerApiService } from "./serverapi.service";
import { ListData } from "./list-data";
import { ServerTasksService } from "./server-tasks.service";

/**
 * Convenient and cached access to server side project descriptions.
 */
@Injectable()
export class AdminListProjectDataService extends ListData<
  ProjectListDescription
> {
  public constructor(
    serverApi: ServerApiService,
    http: HttpClient,
    serverTaskService: ServerTasksService
  ) {
    super(http, serverApi.getAdminProjectListUrl(), serverTaskService);
  }
}
