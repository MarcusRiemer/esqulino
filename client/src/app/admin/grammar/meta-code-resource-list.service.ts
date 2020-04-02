import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { ServerApiService } from "../../shared";
import { ListData } from "../../shared/serverdata";

import { MetaCodeResourceListDescription } from "./meta-code-resource.description";

@Injectable()
export class ListMetaCodeResourcesService {
  constructor(
    private _httpClient: HttpClient,
    private _serverApi: ServerApiService
  ) {}

  readonly metaCodeResources = new ListData<MetaCodeResourceListDescription>(
    this._httpClient,
    this._serverApi.getMetaCodeResourceListUrl()
  );
}
