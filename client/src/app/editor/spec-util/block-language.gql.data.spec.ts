import { generateUUIDv4 } from "../../shared/util-browser";
import { AdminListBlockLanguagesQuery } from "../../../generated/graphql";
import { GraphQLError } from "graphql/error/GraphQLError";

type BlockLanguageGQLResponse = {
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
): BlockLanguageGQLResponse => {
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
): BlockLanguageGQLResponse => {
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
export const buildEmptyBlockLanguageResponse = (): BlockLanguageGQLResponse => {
  return wrapBlockLanguageData([]);
};
