import { generateUUIDv4 } from "../../shared/util-browser";
import {
  AdminListGrammarsQuery,
  GrammarDescriptionItemQuery,
} from "../../../generated/graphql";
import { GraphQLError } from "graphql/error/GraphQLError";

type GrammarGQLResponse = {
  data: AdminListGrammarsQuery;
  errors: ReadonlyArray<GraphQLError>;
};
type AdminListGrammarNode = AdminListGrammarsQuery["grammars"]["nodes"][0];

type GrammarDescriptionItemNode = GrammarDescriptionItemQuery["grammars"]["nodes"][0];
type GrammarItemGQLResponse = {
  data: GrammarDescriptionItemQuery;
  errors: ReadonlyArray<GraphQLError>;
};

export const defaultSpecGrammarId = "28066939-7d53-40de-a89b-95bf37c982be";

const ADMIN_LIST_GRAMMAR: AdminListGrammarNode = {
  __typename: "Grammar",
  programmingLanguageId: "28066123-7d53-40de-a89b-95bf37c982be",
  id: defaultSpecGrammarId,
  slug: "28066939-7d53-40de-a89b-95bf37c982be",
  name: "Grammar",
};

const GRAMMAR_DESCRIPTION_ITEM: GrammarDescriptionItemNode = {
  __typename: "Grammar",
  id: defaultSpecGrammarId,
  slug: "28066939-7d53-40de-a89b-95bf37c982be",
  name: "Grammar",
  programmingLanguageId: "28066123-7d53-40de-a89b-95bf37c982be",
  generatedFromId: "28123123-7d53-40de-a89b-95bf37c982be",
  foreignTypes: {},
  foreignVisualisations: {},
  visualisations: {},
  types: {},
};

const wrapGrammarItem = (
  data: GrammarDescriptionItemNode
): GrammarItemGQLResponse => {
  return {
    errors: [],
    data: {
      __typename: "Query",
      grammars: {
        __typename: "GrammarConnection",
        nodes: [data],
      },
    },
  };
};

const wrapGrammarData = (
  ...data: AdminListGrammarNode[]
): GrammarGQLResponse => {
  return {
    errors: [],
    data: {
      grammars: {
        __typename: "GrammarConnection",
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
 * Generates a valid project with a unique ID, that uses
 * the given data (if provided) and uses default data
 */
export const buildSingleGrammarResponse = (
  override?: Partial<AdminListGrammarNode>
): GrammarGQLResponse => {
  const id = override?.id ?? generateUUIDv4();
  const g: AdminListGrammarNode = Object.assign(
    {},
    ADMIN_LIST_GRAMMAR,
    override || {},
    { id }
  );
  return wrapGrammarData(g);
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
  return wrapGrammarData();
};
