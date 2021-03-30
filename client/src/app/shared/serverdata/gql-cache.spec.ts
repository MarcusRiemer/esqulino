import { TestBed } from "@angular/core/testing";
import { Apollo, gql } from "apollo-angular";
import { ApolloTestingModule } from "apollo-angular/testing";

export const NameBlockLanguageDocument = gql`
  query FullBlockLanguage($id: ID!) {
    blockLanguage(id: $id) {
      id
      name
      grammarId
      sidebars
      editorBlocks
    }
  }
`;

const DEFAULT_EMPTY_BLOCKLANGUAGE = Object.freeze({
  __typename: "BlockLanguage",
  id: "96659508-e006-4290-926e-0734e7dd061a",
  name: "Empty Spec Block Language",
  grammarId: "2ca79350-c734-4f61-a44b-cca25cf3a122",
  sidebars: [],
  editorBlocks: [],
});

export function cacheFullBlockLanguage(apollo: Apollo, blockLangDesc: any) {
  // Ensure that nobody passes in a document without the __typename
  const queryData: any = {
    blockLanguage: Object.assign(
      { __typename: "BlockLanguage" },
      blockLangDesc
    ),
  };
  // Don't need to provide explicitly linked ID as it is contained
  // in the given ID and the __typename
  apollo.client.cache.writeQuery({
    query: NameBlockLanguageDocument,
    data: queryData,
    variables: { id: blockLangDesc.id },
  });

  console.log("Explicitly added to GraphQL Cache:", blockLangDesc);
}

xdescribe("GQL Cache", () => {
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
    const res = cache.readQuery({
      query: NameBlockLanguageDocument,
      variables: {
        id: b.id,
      },
    });

    console.log("Cache state", (cache as any).data.data);

    expect(res["name"]).toEqual(b.name);
  });
});
