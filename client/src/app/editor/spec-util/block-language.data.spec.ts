import { TestBed } from "@angular/core/testing";
import { Apollo } from "apollo-angular";
import { getOperationName } from "@apollo/client/utilities";
import { ApolloTestingController, TestOperation } from "apollo-angular/testing";

import { FullBlockLanguageDocument } from "../../../generated/graphql";

import { generateUUIDv4 } from "../../shared/util-browser";
import {
  cacheFullBlockLanguage,
  FullBlockLanguage,
} from "../../shared/serverdata/gql-cache";

import { DEFAULT_SPEC_GRAMMAR_ID } from "./grammar.data.spec";
import { GraphQLError } from "graphql";
import { Operation } from "@apollo/client/core";
import { specGqlWaitQuery } from "./gql-respond-query.spec";

export const DEFAULT_EMPTY_BLOCKLANGUAGE: FullBlockLanguage = Object.freeze<FullBlockLanguage>(
  {
    __typename: "BlockLanguage",
    id: "96659508-e006-4290-926e-0734e7dd061a",
    name: "Empty Spec Block Language",
    sidebars: [],
    slug: null,
    generated: null,
    editorBlocks: [],
    editorComponents: [],
    rootCssClasses: [],
    defaultProgrammingLanguageId: "generic",
    grammarId: DEFAULT_SPEC_GRAMMAR_ID,
    localGeneratorInstructions: { type: "manual" },
    createdAt: Date(),
    updatedAt: Date(),
  }
);

/**
 * Generates a valid block language description with a unique ID, that uses
 * the given data (if provided) and uses default data
 */
export const specBuildBlockLanguageDescription = (
  override?: Partial<FullBlockLanguage>
): FullBlockLanguage => {
  return Object.assign({}, DEFAULT_EMPTY_BLOCKLANGUAGE, override || {}, {
    id: override?.id ?? generateUUIDv4(),
  });
};

export const specCacheBlockLanguage = (response: FullBlockLanguage) => {
  const apollo = TestBed.inject(Apollo);
  cacheFullBlockLanguage(apollo, response);
  return response;
};

export const specProvideBlockLanguageResponse = async (
  response: FullBlockLanguage
) => {
  const op = await specGqlWaitQuery(
    (m: Operation) =>
      m.operationName === getOperationName(FullBlockLanguageDocument) &&
      m.variables.id === response.id,
    `FullBlockLanguage "${response.id}"`
  );
  op.flush({
    data: { blockLanguage: response },
  });
};

export const specProvideMissingBlockLanguageResponse = (id: string) => {
  const testingController = TestBed.inject(ApolloTestingController);

  testingController
    .expectOne(
      (op) =>
        op.operationName === getOperationName(FullBlockLanguageDocument) &&
        op.variables.id === id
    )
    .flush({
      errors: [new GraphQLError(`Block language "${id}" not found`)],
    });
};
