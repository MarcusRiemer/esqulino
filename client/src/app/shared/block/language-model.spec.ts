import { LanguageModelDescription } from './language-model.description'
import { LanguageModel } from './language-model'
import { BlockDescription } from './block.description'

const langEmptyBlocks: LanguageModelDescription = {
  id: "emptyblocks",
  displayName: "Empty Blocks",
  language: {
    name: "emptyBlocks",
    generators: [],
    validators: [
      {
        languageName: "emptyBlocks",
        types: {
          "root": {
            children: {
              "cat_a": {
                type: "allowed",
                childCount: {
                  minOccurs: 1,
                  maxOccurs: Infinity
                },
                nodeTypes: ["a"]
              }
            }
          },
          "a": {},
          "z": {}
        },
        root: "root"
      }
    ]
  },
  blocks: [
    {
      describedType: {
        languageName: "emptyBlocks",
        typeName: "root",
      },
      sidebar: {
        category: "Standard",
      },
      defaultNode: {
        language: "emptyBlocks",
        name: "root",
        children: {
          "cat_a": []
        }
      }
    },
    {
      describedType: {
        languageName: "emptyBlocks",
        typeName: "a",
      },
      sidebar: {
        category: "Standard",
      },
      defaultNode: {
        language: "emptyBlocks",
        name: "a"
      }
    }
  ]
}

describe("LanguageModel", () => {
  it("Empty Blocks: Loads correctly", () => {
    const l = new LanguageModel(langEmptyBlocks);

    expect(l.missingBlocks.length).toEqual(1);
    expect(l.missingBlocks[0]).toEqual({ languageName: "emptyBlocks", typeName: "z" });
  });

  it("Empty Blocks: Constructing default root with children", () => {
    const l = new LanguageModel(langEmptyBlocks);

    const n = l.constructDefaultNode({ languageName: "emptyBlocks", typeName: "root" });
    expect(Object.keys(n.children)).toEqual(["cat_a"]);
  });
});
