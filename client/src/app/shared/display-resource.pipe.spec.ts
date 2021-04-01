import { TestBed } from "@angular/core/testing";
import { Apollo } from "apollo-angular";
import { ApolloTestingModule } from "apollo-angular/testing";
import { take, toArray } from "rxjs/operators";

import {
  FullBlockLanguageDocument,
  NameBlockLanguageGQL,
} from "../../generated/graphql";
import {
  specBuildBlockLanguageDescription,
  specCacheBlockLanguage,
} from "../editor/spec-util";

import { DisplayResourcePipe } from "./display-resource.pipe";

describe("DisplayResourcePipe", () => {
  async function createModule() {
    await TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [NameBlockLanguageGQL],
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
      specBuildBlockLanguageDescription({
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
    const b = specBuildBlockLanguageDescription({
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
