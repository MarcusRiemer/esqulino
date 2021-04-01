import { TestBed } from "@angular/core/testing";
import { ApolloQueryResult } from "@apollo/client/core";
import { Apollo } from "apollo-angular";
import { ApolloTestingModule } from "apollo-angular/testing";

import {
  FullBlockLanguageDocument,
  FullBlockLanguageQuery,
} from "../../../generated/graphql";

import { DEFAULT_EMPTY_BLOCKLANGUAGE } from "../../editor/spec-util";

import { cacheFullBlockLanguage } from "./gql-cache";

describe("GQL Cache", () => {
  async function createModule() {
    await TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [],
    }).compileComponents();

    const apollo = TestBed.inject(Apollo);

    return { apollo };
  }

  it(`Stores and reads a block language`, async () => {
    const t = await createModule();

    const b = DEFAULT_EMPTY_BLOCKLANGUAGE;

    cacheFullBlockLanguage(t.apollo, b);

    const cache = t.apollo.client.cache;
    const res = cache.readQuery<FullBlockLanguageQuery>({
      query: FullBlockLanguageDocument,
      variables: {
        id: b.id,
      },
    });

    expect(res.blockLanguage.name).toEqual(b.name);
  });
});
