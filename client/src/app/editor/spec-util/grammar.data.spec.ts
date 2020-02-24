import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { GrammarDescription } from "../../shared/";
import { generateUUIDv4 } from '../../shared/util-browser';
import { ServerApiService, GrammarDataService } from '../../shared/serverdata';

const DEFAULT_EMPTY_GRAMMAR = Object.freeze<GrammarDescription>({
  id: "96659508-e006-4290-926e-0734e7dd061a",
  name: "Empty Spec Grammar",
  programmingLanguageId: "spec",
  root: { languageName: "spec", typeName: "root" },
  types: {
    "spec": {
      "root": {
        type: "concrete"
      }
    }
  }
});

/**
 * Generates a valid grammar description with a unique ID, that uses
 * the given data (if provided) and uses default data
 */
export const buildGrammar = (
  override?: Partial<GrammarDescription>
): GrammarDescription => {
  return (Object.assign({}, DEFAULT_EMPTY_GRAMMAR, override || {}, { id: generateUUIDv4() }));
};

export const ensureLocalGrammarRequest = (
  response: GrammarDescription
) => {
  const httpTestingController = TestBed.inject(HttpTestingController);
  const serverApi = TestBed.inject(ServerApiService);
  const GrammarData = TestBed.inject(GrammarDataService);

  const toReturn = GrammarData.getLocal(response.id, "request");

  httpTestingController.expectOne(serverApi.individualGrammarUrl(response.id))
    .flush(response);

  return (toReturn);
}