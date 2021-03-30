import * as Apollo from "apollo-angular";

import {
  FullBlockLanguageDocument,
  FullBlockLanguageQuery,
} from "../../../generated/graphql";

export type FullBlockLanguage = FullBlockLanguageQuery["blockLanguage"];

export function cacheFullBlockLanguage(
  apollo: Apollo.Apollo,
  blockLangDesc: FullBlockLanguage
) {
  // Make the block language available to the rendered trees
  const queryData: FullBlockLanguageQuery = {
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
