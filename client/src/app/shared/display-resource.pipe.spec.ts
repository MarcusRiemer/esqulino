import { TestBed } from "@angular/core/testing";
import { getOperationName } from "@apollo/client/utilities";
import { Apollo } from "apollo-angular";
import { ApolloTestingModule } from "apollo-angular/testing";
import { take, toArray } from "rxjs/operators";

import {
  NameBlockLanguageDocument,
  NameBlockLanguageGQL,
} from "../../generated/graphql";
import {
  specBuildBlockLanguageDescription,
  specCacheBlockLanguage,
} from "../editor/spec-util";
import { specGqlWaitQuery } from "../editor/spec-util/gql-respond-query.spec";

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

  it(`Immediatly resolves "ProjectUsesBlockLanguage" `, async () => {
    const t = await createModule();

    const b = specCacheBlockLanguage(
      specBuildBlockLanguageDescription({
        id: "c5f3f0e6-ad24-497a-9e14-99fc54cd0cde",
        name: "B1",
      })
    );

    const names$ = t.pipe.transform({
      id: "f45155e4-c78d-44c2-9c44-901058327f4b",
      blockLanguageId: b.id,
    });

    const names = await names$.pipe(toArray()).toPromise();
    expect(names).toEqual([b.id, b.name]);
  });

  it(`Delivers "ProjectUsesBlockLanguage" if resolved later`, async () => {
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

    const op = await specGqlWaitQuery(
      (m) =>
        m.operationName === getOperationName(NameBlockLanguageDocument) &&
        m.variables.id === b.id,
      `NameBlockLanguage "${b.id}"`
    );
    op.flush({
      data: {
        blockLanguage: { id: b.id, name: b.name, __typename: b.__typename },
      },
    });

    const names = await names$;
    expect(names).toEqual([b.id, b.name]);
  });
});
