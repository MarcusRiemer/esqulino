import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ProjectDescription, ProjectListDescription } from '../project.description';

import { ServerApiService } from './serverapi.service';
import { ListData } from './data-service';
import { IndividualData } from './individual-data';

@Injectable()
export class IndividualProjectDataService extends IndividualData<ProjectDescription> {
  constructor(
    serverApi: ServerApiService,
    http: HttpClient,
  ) {
    super(http, (id) => serverApi.getProjectUrl(id), "Project")
  }
}

/**
 * Convenient and cached access to server side project descriptions.
 */
@Injectable()
export class ProjectDataService extends ListData<ProjectListDescription> {

  public constructor(
    serverApi: ServerApiService,
    http: HttpClient
  ) {
    super(http, serverApi.getProjectListUrl());
  }
}