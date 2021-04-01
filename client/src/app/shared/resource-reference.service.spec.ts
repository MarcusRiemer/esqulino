import { TestBed } from "@angular/core/testing";
import {
  ApolloTestingModule,
  APOLLO_TESTING_CACHE,
} from "apollo-angular/testing";

import { FullBlockLanguageGQL, FullGrammarGQL } from "../../generated/graphql";

import {
  ResourceReferencesService,
  ResourceRetrievalError,
} from "./resource-references.service";
import { LanguageService } from "./language.service";
import {
  specBuildGrammarDescription,
  specCacheGrammar,
  specProvideGrammarResponse,
} from "../editor/spec-util";
import { InMemoryCache } from "@apollo/client/core";
import { Apollo } from "apollo-angular";

describe(`ResourceReferencesService`, () => {
  function instantiate(): ResourceReferencesService {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [
        {
          provide: APOLLO_TESTING_CACHE,
          useValue: new InMemoryCache({ addTypename: false }),
        },
        LanguageService,
        FullBlockLanguageGQL,
        FullGrammarGQL,
        ResourceReferencesService,
      ],
      declarations: [],
    });

    return TestBed.inject(ResourceReferencesService);
  }

  it(`can be instantiated`, async () => {
    const s = instantiate();
    expect(s).toBeDefined();
  });

  describe(`getGrammarDescription`, () => {
    it(`Grammar requestable, throw, network-only`, async () => {
      const s = instantiate();

      const g = specBuildGrammarDescription({
        id: "00000000-0000-0000-0000-000000000001",
      });

      const request = s.getGrammarDescription(g.id, {
        onMissing: "throw",
        fetchPolicy: "network-only",
      });

      specProvideGrammarResponse(g);

      const result = await request;

      expect(result.id).toEqual(g.id);
    });

    it(`Grammar cached, throw, cache-only`, async () => {
      const s = instantiate();

      const g = specCacheGrammar(
        specBuildGrammarDescription({
          id: "00000000-0000-0000-0000-000000000002",
        })
      );

      const apollo = TestBed.inject(Apollo);
      const cacheState = (apollo.client.cache as any).data.data;

      pending("GraphQL Caching seems to be broken in specs");

      const result = await s.getGrammarDescription(g.id, {
        onMissing: "throw",
        fetchPolicy: "cache-only",
      });

      expect(result.id).toEqual(g.id);
    });

    it(`Grammar missing, throw, cache-only`, (done) => {
      const s = instantiate();

      s.getGrammarDescription("00000000-0000-0000-0000-000000000003", {
        onMissing: "throw",
        fetchPolicy: "cache-only",
      }).then(
        () => {
          fail();
        },
        (e) => {
          expect(e instanceof ResourceRetrievalError).toBeTrue();
          done();
        }
      );
    });

    it(`Grammar missing, undefined, cache-only`, async () => {
      const s = instantiate();

      expect(
        await s.getGrammarDescription("00000000-0000-0000-0000-000000000004", {
          onMissing: "undefined",
          fetchPolicy: "cache-only",
        })
      ).toBeUndefined();
    });
  });
});
