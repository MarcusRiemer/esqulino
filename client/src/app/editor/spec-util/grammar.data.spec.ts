import { TestBed } from "@angular/core/testing";

import { GrammarDescription } from "../../shared/";
import { generateUUIDv4 } from "../../shared/util-browser";
import { ApolloTestingController } from "apollo-angular/testing";
import { FullGrammarDocument } from "src/generated/graphql";
import { ResourceReferencesService } from "src/app/shared/resource-references.service";

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
export const mkGrammarDescription = (
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
  const testingController = TestBed.inject(ApolloTestingController);
  const resourceReferences = TestBed.inject(ResourceReferencesService);

  const toReturn = resourceReferences.getGrammarDescription(
    response.id,
    "throw"
  );

  testingController
    .expectOne(
      (op) =>
        op.query === FullGrammarDocument && op.variables.id === response.id
    )
    .flush({
      data: { grammar: response },
    });

  return toReturn;
};
