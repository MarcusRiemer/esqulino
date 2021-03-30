import { TestBed } from "@angular/core/testing";
import { InMemoryCache } from "@apollo/client/core";
import { Apollo } from "apollo-angular";
import {
  ApolloTestingModule,
  APOLLO_TESTING_CACHE,
} from "apollo-angular/testing";
import { take, toArray } from "rxjs/operators";

import {
  FullBlockLanguageDocument,
  NameBlockLanguageGQL,
} from "../../generated/graphql";
import {
  specBuildBlockLanguage,
  specCacheBlockLanguage,
} from "../editor/spec-util";

import { DisplayResourcePipe } from "./display-resource.pipe";

describe("DisplayResourcePipe", () => {
  async function createModule() {
    await TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [
        /*
        {
          provide: APOLLO_TESTING_CACHE,
          useValue: new InMemoryCache({
            typePolicies: {
              Query: {
                fields: {
                  blockLanguage: (_, { toReference, variables }) => {
                    if (variables?.id) {
                      console.log("blockLanguage: toReference", variables);
                      return toReference({
                        __typename: "BlockLanguage",
                        id: variables.id,
                      });
                    }
                  },
                },
              },
            },
          }),
        },*/

        NameBlockLanguageGQL,
      ],
      declarations: [DisplayResourcePipe],
    }).compileComponents();

    const nameBlockLanguage = TestBed.inject(NameBlockLanguageGQL);
    const apollo = TestBed.inject(Apollo);
    const pipe = new DisplayResourcePipe(nameBlockLanguage);

    return { apollo, pipe };
  }

  it("create an instance", async () => {
    const t = await createModule();
    expect(t.pipe).toBeTruthy();
  });

  xit(`Immediatly resolves "ProjectUsesBlockLanguage" `, async () => {
    const t = await createModule();

    const b = specCacheBlockLanguage(
      specBuildBlockLanguage({
        id: "c5f3f0e6-ad24-497a-9e14-99fc54cd0cde",
        name: "B1",
      })
    );

    const cache = t.apollo.client.cache;
    const res = cache.readQuery({
      query: FullBlockLanguageDocument,
      variables: {
        id: b.id,
      },
    });

    console.log("Cache state", (cache as any).data.data);

    expect(res["name"]).toEqual(b.name);

    const names$ = t.pipe.transform({
      id: "f45155e4-c78d-44c2-9c44-901058327f4b",
      blockLanguageId: b.id,
    });

    const names = await names$.pipe(take(2), toArray()).toPromise();
    expect(names).toEqual([b.id, b.name]);
  });

  xit(`Delivers "ProjectUsesBlockLanguage" if resolved later`, async () => {
    const t = await createModule();

    // Exists, but not yet cached
    const b = specBuildBlockLanguage({
      id: "c5f3f0e6-ad24-497a-9e14-99fc54cd0cde",
      name: "B1",
    });

    const names$ = t.pipe
      .transform({
        id: "f45155e4-c78d-44c2-9c44-901058327f4b",
        blockLanguageId: b.id,
      })
      .pipe(take(2), toArray())
      .toPromise();

    // Cache now
    specCacheBlockLanguage(b);

    const names = await names$;
    expect(names).toEqual([b.id, b.name]);
  });
});
