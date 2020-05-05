import { Injectable, OnDestroy, Optional } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";

import { Subscription } from "rxjs";

import { GrammarDescription, GrammarListDescription } from "../syntaxtree";

import { ServerApiService } from "./serverapi.service";
import { ListData } from "./list-data";
import { IndividualData } from "./individual-data";
import { MutateData } from "./mutate-data";
import { ServerTasksService } from "./server-tasks.service";
import { NewsDescription } from "../news.description";

const urlResolver = (serverApi: ServerApiService) => {
  return (id: string) => serverApi.individualGrammarUrl(id);
};

/**
 * Cached access to lists of grammars.
 */
@Injectable()
export class AdminListNewsDataService extends ListData<NewsDescription> {
  private _subscriptions: Subscription[] = [];

  constructor(
    serverApi: ServerApiService,
    http: HttpClient,
    //mutateService: MutateGrammarService,
    serverTaskService: ServerTasksService
  ) {
    super(http, serverApi.getAdminNewsListUrl(), serverTaskService);
  }
}
