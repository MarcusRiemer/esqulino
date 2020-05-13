import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { ServerApiService } from "../../shared";
import { ListData } from "../../shared/serverdata";
import { ServerTasksService } from "../../shared/serverdata/server-tasks.service";

import { MetaCodeResourceListDescription } from "./meta-code-resource.description";

@Injectable()
export class ListMetaCodeResourcesService {
  constructor(
    private _httpClient: HttpClient,
    private _serverApi: ServerApiService,
    private _serverTasks: ServerTasksService
  ) {}

  readonly metaCodeResources = new ListData<MetaCodeResourceListDescription>(
    this._httpClient,
    this._serverApi.getMetaCodeResourceListUrl(),
    this._serverTasks
  );
}
