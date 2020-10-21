import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { GrammarDescription } from "../syntaxtree";

import { ServerApiService } from "./serverapi.service";
import { IndividualData } from "./individual-data";

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
