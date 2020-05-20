import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import {
  ProjectDescription,
  ProjectListDescription,
} from "../project.description";

import { ServerApiService } from "./serverapi.service";
import { ListData } from "./list-data";
import { IndividualData } from "./individual-data";
import { ServerTasksService } from "./server-tasks.service";
import { MutateBlockLanguageService } from "./blocklanguage-data.service";

@Injectable()
export class IndividualProjectDataService extends IndividualData<
  ProjectDescription
> {
  constructor(serverApi: ServerApiService, http: HttpClient) {
    super(http, (id) => serverApi.getProjectUrl(id), "Project");
  }
}

/**
 * Convenient and cached access to server side project descriptions.
 */
@Injectable()
export class ProjectDataService extends ListData<ProjectListDescription> {
  public constructor(
    serverApi: ServerApiService,
    http: HttpClient,
    serverTaskService: ServerTasksService
  ) {
    super(http, serverApi.getProjectListUrl(), serverTaskService);
  }
}
