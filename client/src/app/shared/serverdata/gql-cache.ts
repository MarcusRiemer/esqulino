import * as Apollo from "apollo-angular";

import {
  FullBlockLanguageDocument,
  FullBlockLanguageQuery,
  FullGrammarDocument,
  FullGrammarQuery,
} from "../../../generated/graphql";

export type FullBlockLanguage = FullBlockLanguageQuery["blockLanguage"];
export type FullGrammar = FullGrammarQuery["grammar"];

export function cacheFullBlockLanguage(
  apollo: Apollo.Apollo,
  blockLangDesc: FullBlockLanguage
) {
  // Make the block language available to the rendered trees
  const queryData: FullBlockLanguageQuery = {
    __typename: "Query",
    blockLanguage: Object.assign(
      { __typename: "BlockLanguage" },
      blockLangDesc
    ),
  };
  // Don't need to provide explicitly linked ID as it is contained
  // in the given ID and the __typename
  apollo.client.cache.writeQuery({
    query: FullBlockLanguageDocument,
    data: queryData,
    variables: { id: blockLangDesc.id },
  });

  console.log("Explicitly added to GraphQL Cache:", blockLangDesc);
}

export function cacheFullGrammar(
  apollo: Apollo.Apollo,
  grammarDesc: FullGrammar
) {
  // Make the block language available to the rendered trees
  const queryData: FullGrammarQuery = {
    __typename: "Query",
    grammar: Object.assign({ __typename: "Grammar" }, grammarDesc),
  };
  // Don't need to provide explicitly linked ID as it is contained
  // in the given ID and the __typename
  apollo.client.cache.writeQuery({
    query: FullGrammarDocument,
    data: queryData,
    variables: { id: grammarDesc.id },
  });

  console.log("Explicitly added to GraphQL Cache:", grammarDesc);
}
