import { GraphQLError } from "graphql/error/GraphQLError";

import { AdminListBlockLanguagesQuery } from "../../../generated/graphql";

import { generateUUIDv4 } from "../../shared/util-browser";

type BlockLanguageAdminResponse = {
  data: AdminListBlockLanguagesQuery;
  errors: ReadonlyArray<GraphQLError>;
};
type AdminListBlockLanguageNode =
  AdminListBlockLanguagesQuery["blockLanguages"]["nodes"][0];

const ADMIN_LIST_BLOCKLANGUAGE: AdminListBlockLanguageNode = {
  __typename: "BlockLanguage",
  id: "96659508-e006-4290-926e-0734e7dd061a",
  name: "Empty Spec Block Language",
  slug: "BlockLanguage Slug",
  generated: true,
  grammarId: "96659508-e006-4290-926e-0734e7dd072b",
};

const specAdminwrapBlockLanguageData = (
  data: AdminListBlockLanguageNode[]
): BlockLanguageAdminResponse => {
  return {
    errors: [],
    data: {
      blockLanguages: {
        __typename: "BlockLanguageConnection",
        nodes: data,
        totalCount: data.length,
        pageInfo: {
          __typename: "PageInfo",
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
export const specAdminBuildSingleBlockLanguageResponse = (
  override?: AdminListBlockLanguageNode
): BlockLanguageAdminResponse => {
  const blockLanguages: AdminListBlockLanguageNode[] = [];
  blockLanguages.push(
    Object.assign({}, ADMIN_LIST_BLOCKLANGUAGE, override || {}, {
      id: generateUUIDv4(),
    })
  );
  return specAdminwrapBlockLanguageData(blockLanguages);
};

/**
 * Generates an empty project response
 */
export const specAdminbuildEmptyBlockLanguageResponse =
  (): BlockLanguageAdminResponse => {
    return specAdminwrapBlockLanguageData([]);
  };
