import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import {
  BlockLanguageDescription,
} from "../block/block-language.description";

import { ServerApiService } from "./serverapi.service";
import { IndividualData } from "./individual-data";

const urlResolver = (serverApi: ServerApiService) => {
  return (id: string) => serverApi.individualBlockLanguageUrl(id);
};

@Injectable()
export class IndividualBlockLanguageDataService extends IndividualData<
  BlockLanguageDescription
> {
  constructor(serverApi: ServerApiService, http: HttpClient) {
    super(http, urlResolver(serverApi), "BlockLanguage");
  }
}
