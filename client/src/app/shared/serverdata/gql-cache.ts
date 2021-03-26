import * as Apollo from "apollo-angular";

import {
  FullBlockLanguageDocument,
  FullBlockLanguageQuery,
} from "../../../generated/graphql";

export type FullBlockLanguage = FullBlockLanguageQuery["blockLanguages"]["nodes"][0];

export function cacheFullBlockLanguage(
  apollo: Apollo.Apollo,
  blockLangDesc: FullBlockLanguage
) {
  // Make the block language available to the rendered trees
  const cache = apollo.client.cache;
  const queryData: FullBlockLanguageQuery = {
    blockLanguages: {
      nodes: [blockLangDesc],
    },
  };
  apollo.client.writeQuery({
    id: cache.identify({
      __typename: "BlockLanguage",
      id: blockLangDesc.id,
    }),
    query: FullBlockLanguageDocument,
    data: queryData,
    variables: { id: blockLangDesc.id },
  });

  console.log("Explicitly added to GraphQL Cache:", blockLangDesc);
}
