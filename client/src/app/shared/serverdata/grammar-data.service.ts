import {Mutation, Query, gql} from 'apollo-angular';
import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";




import { Subscription } from "rxjs";
import { map, first } from "rxjs/operators";

import {
  GrammarDescription,
  GrammarListDescription,
  GrammarListGraphQlResponse,
} from "../syntaxtree";
import { fieldCompare } from "../util";

import { ServerApiService } from "./serverapi.service";
import { ListData } from "./list-data";
import { IndividualData } from "./individual-data";
import { MutateData } from "./mutate-data";
import { ServerTasksService } from "./server-tasks.service";

const urlResolver = (serverApi: ServerApiService) => {
  return (id: string) => serverApi.individualGrammarUrl(id);
};

/**
 * Cached access to individual grammars
 */
@Injectable()
export class IndividualGrammarDataService extends IndividualData<
  GrammarDescription
> {
  constructor(serverApi: ServerApiService, http: HttpClient) {
    super(http, urlResolver(serverApi), "Grammar");
  }
}
