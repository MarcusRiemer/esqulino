import { TestBed } from "@angular/core/testing";
import { ApolloTestingModule } from "apollo-angular/testing";

import { FullBlockLanguageGQL, FullGrammarGQL } from "../../generated/graphql";

import {
  ResourceReferencesService,
  ResourceRetrievalError,
} from "./resource-references.service";
import { LanguageService } from "./language.service";
import {
  specBuildBlockLanguageDescription,
  specBuildGrammarDescription,
  specCacheBlockLanguage,
  specCacheGrammar,
  specProvideBlockLanguageResponse,
  specProvideGrammarResponse,
  specProvideMissingBlockLanguageResponse,
} from "../editor/spec-util";

describe(`ResourceReferencesService`, () => {
  function instantiate(): ResourceReferencesService {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [
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

  describe(`getBlockLanguageDescription`, () => {
    it(`requestable, throw, network-only`, async () => {
      const s = instantiate();

      const b = specBuildBlockLanguageDescription({
        id: "00000000-0000-0000-0000-000000000001",
      });

      const request = s.getBlockLanguage(b.id, {
        onMissing: "throw",
        fetchPolicy: "network-only",
      });

      await specProvideBlockLanguageResponse(b);

      const result = await request;

      expect(result.id).toEqual(b.id);
    });

    it(`not requestable, throw, network-only`, async (done) => {
      const s = instantiate();

      const id = "00000000-0000-0000-0000-0000000000a1";

      const request = s.getBlockLanguage(id, {
        onMissing: "throw",
        fetchPolicy: "network-only",
      });

      specProvideMissingBlockLanguageResponse(id);

      try {
        await request;
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ResourceRetrievalError);
        done();
      }
    });

    it(`cached, throw, cache-only`, async () => {
      const s = instantiate();

      const b = specCacheBlockLanguage(
        specBuildBlockLanguageDescription({
          id: "00000000-0000-0000-0000-000000000002",
        })
      );

      const result = await s.getBlockLanguage(b.id, {
        onMissing: "throw",
        fetchPolicy: "cache-only",
      });

      expect(result.id).toEqual(b.id);
    });

    it(`missing, throw, cache-only`, async (done) => {
      const s = instantiate();

      try {
        await s.getBlockLanguage("00000000-0000-0000-0000-000000000003", {
          onMissing: "throw",
          fetchPolicy: "cache-only",
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ResourceRetrievalError);
        done();
      }
    });

    it(`missing, undefined, cache-only`, async () => {
      const s = instantiate();

      expect(
        await s.getBlockLanguage("00000000-0000-0000-0000-000000000004", {
          onMissing: "undefined",
          fetchPolicy: "cache-only",
        })
      ).toBeUndefined();
    });

    it(`cached, throw, cache-first`, async () => {
      const s = instantiate();

      const b = specCacheBlockLanguage(
        specBuildBlockLanguageDescription({
          id: "00000000-0000-0000-0000-000000000005",
        })
      );

      const result = await s.getBlockLanguage(b.id, {
        onMissing: "throw",
        fetchPolicy: "cache-first",
      });

      expect(result.id).toEqual(b.id);
    });

    it(`missing but requestable, throw, cache-first`, async () => {
      const s = instantiate();

      const b = specBuildBlockLanguageDescription({
        id: "00000000-0000-0000-0000-000000000006",
      });

      const result$ = s.getBlockLanguage(b.id, {
        onMissing: "throw",
        fetchPolicy: "cache-first",
      });

      specProvideBlockLanguageResponse(b);

      const result = await result$;
      expect(result.id).toEqual(b.id);
    });

    it(`missing and not requestable, throw, cache-first`, async (done) => {
      const s = instantiate();

      const id = "00000000-0000-0000-0000-000000000007";

      const result$ = s.getBlockLanguage(id, {
        onMissing: "throw",
        fetchPolicy: "cache-first",
      });

      specProvideMissingBlockLanguageResponse(id);

      try {
        await result$;
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ResourceRetrievalError);
        done();
      }
    });

    it(`missing and not requestable, undefined, cache-first`, async () => {
      const s = instantiate();

      const id = "00000000-0000-0000-0000-0000000000b7";

      const result$ = s.getBlockLanguage(id, {
        onMissing: "undefined",
        fetchPolicy: "cache-first",
      });

      specProvideMissingBlockLanguageResponse(id);

      const result = await result$;
      expect(result).toBeUndefined();
    });
  });

  describe(`getGrammarDescription`, () => {
    it(`requestable, throw, network-only`, async () => {
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

    it(`cached, throw, cache-only`, async () => {
      const s = instantiate();

      const g = specCacheGrammar(
        specBuildGrammarDescription({
          id: "00000000-0000-0000-0000-000000000002",
        })
      );

      const result = await s.getGrammarDescription(g.id, {
        onMissing: "throw",
        fetchPolicy: "cache-only",
      });

      expect(result.id).toEqual(g.id);
    });

    it(`missing, throw, cache-only`, (done) => {
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
