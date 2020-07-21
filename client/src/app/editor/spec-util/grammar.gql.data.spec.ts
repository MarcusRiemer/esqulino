import { generateUUIDv4 } from "../../shared/util-browser";
import {
  AdminListBlockLanguagesQuery,
  AdminListGrammarsQuery,
  GrammarDescriptionItemQuery,
} from "../../../generated/graphql";
import {GraphQLError} from "graphql/error/GraphQLError";

type GrammarGQLResponse = { data: AdminListGrammarsQuery, errors:ReadonlyArray<GraphQLError> };
type AdminListGrammarNode = AdminListGrammarsQuery["grammars"]["nodes"][0];

type GrammarDescriptionItemNode = GrammarDescriptionItemQuery["singleGrammar"];
type GrammarItemGQLResponse = { data: GrammarDescriptionItemQuery, errors:ReadonlyArray<GraphQLError> };

const ADMIN_LIST_Grammar: AdminListGrammarNode = {
  id: "28066939-7d53-40de-a89b-95bf37c982be",
  slug: "28066939-7d53-40de-a89b-95bf37c982be",
  name: "Grammar",
};

const GRAMMAR_DESCRIPTION_ITEM: GrammarDescriptionItemNode = {
  id: "28066939-7d53-40de-a89b-95bf37c982be",
  slug: "28066939-7d53-40de-a89b-95bf37c982be",
  name: "Grammar",
  programmingLanguageId: "28066123-7d53-40de-a89b-95bf37c982be",
  generatedFromId: "28123123-7d53-40de-a89b-95bf37c982be",
  foreignTypes: {},
  root: {},
  types: {},
};

const wrapGrammarItem = (
  data: GrammarDescriptionItemNode
): GrammarItemGQLResponse => {
  return {
    errors:[],
    data: {
      singleGrammar: data,
    },
  };
};

const wrapGrammarData = (data: AdminListGrammarNode[]): GrammarGQLResponse => {
  return {
    errors:[],
    data: {
      grammars: {
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
 * Generates a valid project with a unique ID, that uses
 * the given data (if provided) and uses default data
 */
export const buildSingleGrammarResponse = (
  override?: AdminListGrammarNode
): GrammarGQLResponse => {
  const id = override?.id ?? generateUUIDv4();
  const projects: AdminListGrammarNode[] = [];
  projects.push(Object.assign({}, ADMIN_LIST_Grammar, override || {}, { id }));
  return wrapGrammarData(projects);
};
/**
 * Generates a valid project with a unique ID, that uses
 * the given data (if provided) and uses default data
 */
export const buildGrammarDescItemResponse = (
  override?: GrammarDescriptionItemNode
): GrammarItemGQLResponse => {
  const id = override?.id ?? generateUUIDv4();
  return wrapGrammarItem(
    Object.assign({}, GRAMMAR_DESCRIPTION_ITEM, override || {}, { id })
  );
};

/**
 * Generates an empty project response
 */
export const buildEmptyGrammarResponse = (): GrammarGQLResponse => {
  return wrapGrammarData([]);
};
