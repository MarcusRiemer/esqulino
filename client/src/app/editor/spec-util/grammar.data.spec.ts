import { TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";

import { GrammarDescription, GrammarListDescription } from "../../shared/";
import { generateUUIDv4 } from "../../shared/util-browser";
import {
  ServerApiService,
  IndividualGrammarDataService,
} from "../../shared/serverdata";

import { ListOrder, provideListResponse } from "./list.data.spec";

const DEFAULT_EMPTY_GRAMMAR = Object.freeze<GrammarDescription>({
  id: "96659508-e006-4290-926e-0734e7dd061a",
  name: "Empty Spec Grammar",
  programmingLanguageId: "spec",
  root: { languageName: "spec", typeName: "root" },
  types: {
    spec: {
      root: {
        type: "concrete",
      },
    },
  },
});

/**
 * Generates a valid grammar description with a unique ID, that uses
 * the given data (if provided) and uses default data
 */
export const buildGrammar = (
  override?: Partial<GrammarDescription>
): GrammarDescription => {
  const id = override?.id ?? generateUUIDv4();
  return Object.assign({}, DEFAULT_EMPTY_GRAMMAR, override || {}, { id });
};

/**
 * Ensures that the given grammar will be available at the GrammarDataService.
 */
export const ensureLocalGrammarRequest = (
  response: GrammarDescription
): Promise<GrammarDescription> => {
  const httpTestingController = TestBed.inject(HttpTestingController);
  const serverApi = TestBed.inject(ServerApiService);
  const grammarData = TestBed.inject(IndividualGrammarDataService);

  const toReturn = grammarData.getLocal(response.id, "request");

  httpTestingController
    .expectOne(serverApi.individualGrammarUrl(response.id))
    .flush(response);

  return toReturn;
};

export type GrammarOrder = ListOrder<GrammarListDescription>;

/**
 * Expects a request for the given list of grammars. If a ordered dataset
 * is requested, the `items` param must be already ordered accordingly.
 */
export const provideGrammarList = (
  items: GrammarDescription[],
  options?: {
    order?: GrammarOrder;
    pagination?: {
      limit: number;
      page: number;
    };
  }
) => {
  const serverApi = TestBed.inject(ServerApiService);
  let reqUrl = serverApi.getGrammarListUrl();

  return provideListResponse(items, reqUrl, options);
};
