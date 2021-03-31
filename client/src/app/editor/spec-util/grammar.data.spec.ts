import { TestBed } from "@angular/core/testing";
import { ApolloTestingController } from "apollo-angular/testing";

import { FullGrammarDocument } from "../../../generated/graphql";

import { GrammarDescription } from "../../shared/";
import { generateUUIDv4 } from "../../shared/util-browser";
import { ResourceReferencesService } from "src/app/shared/resource-references.service";
import {
  cacheFullGrammar,
  FullGrammar,
} from "../../shared/serverdata/gql-cache";
import { Apollo } from "apollo-angular";

const DEFAULT_EMPTY_GRAMMAR = Object.freeze<GrammarDescription>({
  id: "96659508-e006-4290-926e-0734e7dd061a",
  name: "Empty Spec Grammar",
  programmingLanguageId: "generic",
  root: { languageName: "spec", typeName: "root" },
  foreignTypes: {},
  foreignVisualisations: {},
  visualisations: {},
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
export const specBuildGrammarDescription = (
  override?: Partial<GrammarDescription>
): GrammarDescription => {
  const id = override?.id ?? generateUUIDv4();
  return Object.assign({}, DEFAULT_EMPTY_GRAMMAR, override || {}, { id });
};

export const specCacheGrammar = (response: FullGrammar) => {
  const apollo = TestBed.inject(Apollo);
  cacheFullGrammar(apollo, response);
  return response;
};

/**
 * Ensures that the given grammar will be available at the GrammarDataService.
 */
export const specEnsureLocalGrammarRequest = (
  response: GrammarDescription
): Promise<GrammarDescription> => {
  const resourceReferences = TestBed.inject(ResourceReferencesService);

  const toReturn = resourceReferences.getGrammarDescription(response.id, {
    fetchPolicy: "network-only",
    onMissing: "throw",
  });

  specProvideGrammarResponse(response);

  return toReturn;
};

export const specProvideGrammarResponse = (response: GrammarDescription) => {
  const testingController = TestBed.inject(ApolloTestingController);

  testingController
    .expectOne(
      (op) =>
        op.query === FullGrammarDocument && op.variables.id === response.id
    )
    .flush({
      data: { grammar: response },
    });
};
