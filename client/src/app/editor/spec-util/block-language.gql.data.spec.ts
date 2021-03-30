import { TestBed } from "@angular/core/testing";
import { Apollo } from "apollo-angular";
import { GraphQLError } from "graphql/error/GraphQLError";

import { AdminListBlockLanguagesQuery } from "../../../generated/graphql";

import { generateUUIDv4 } from "../../shared/util-browser";
import {
  cacheFullBlockLanguage,
  FullBlockLanguage,
} from "../../shared/serverdata/gql-cache";

import { defaultSpecGrammarId } from "./grammar.gql.data.spec";

const DEFAULT_EMPTY_BLOCKLANGUAGE: FullBlockLanguage = Object.freeze<FullBlockLanguage>(
  {
    __typename: "BlockLanguage",
    id: "96659508-e006-4290-926e-0734e7dd061a",
    name: "Empty Spec Block Language",
    sidebars: [],
    editorBlocks: [],
    editorComponents: [],
    rootCssClasses: [],
    defaultProgrammingLanguageId: "generic",
    grammarId: defaultSpecGrammarId,
    localGeneratorInstructions: { type: "manual" },
    createdAt: Date(),
    updatedAt: Date(),
  }
);

/**
 * Generates a valid block language description with a unique ID, that uses
 * the given data (if provided) and uses default data
 */
export const specBuildBlockLanguage = (
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

type BlockLanguageAdminResponse = {
  data: AdminListBlockLanguagesQuery;
  errors: ReadonlyArray<GraphQLError>;
};
type AdminListBlockLanguageNode = AdminListBlockLanguagesQuery["blockLanguages"]["nodes"][0];

const ADMIN_LIST_BLOCKLANGUAGE: AdminListBlockLanguageNode = {
  id: "96659508-e006-4290-926e-0734e7dd061a",
  name: "Empty Spec Block Language",
  slug: "BlockLanguage Slug",
  generated: true,
  grammarId: "96659508-e006-4290-926e-0734e7dd072b",
};

const wrapBlockLanguageData = (
  data: AdminListBlockLanguageNode[]
): BlockLanguageAdminResponse => {
  return {
    errors: [],
    data: {
      blockLanguages: {
        nodes: data,
        totalCount: data.length,
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: false,
          startCursor: "NQ",
          endCursor: "NQ",
        },
      },
    },
  };
};

/**
 * Generates a valid block language description with a unique ID, that uses
 * the given data (if provided) and uses default data
 */
export const buildSingleBlockLanguageResponse = (
  override?: AdminListBlockLanguageNode
): BlockLanguageAdminResponse => {
  const blockLanguages: AdminListBlockLanguageNode[] = [];
  blockLanguages.push(
    Object.assign({}, ADMIN_LIST_BLOCKLANGUAGE, override || {}, {
      id: generateUUIDv4(),
    })
  );
  return wrapBlockLanguageData(blockLanguages);
};

/**
 * Generates an empty project response
 */
export const buildEmptyBlockLanguageResponse = (): BlockLanguageAdminResponse => {
  return wrapBlockLanguageData([]);
};
