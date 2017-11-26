import { Tree } from 'app/shared/syntaxtree';

import { LanguageModelDescription } from './language-model.description'
import { LanguageModel } from './language-model'
import { SidebarBlockDescription, EditorBlockDescriptions } from './block.description'

const langEmptyBlocks: LanguageModelDescription = {
  id: "emptyblocks",
  name: "Empty Blocks",
  language: {
    id: "emptyBlocks",
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
  sidebarBlocks: [
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
  ],
  editorBlocks: [
    {
      describedType: {
        languageName: "emptyBlocks",
        typeName: "root",
      },
      visual: [
        {
          blockType: "constant",
          text: "root"
        } as EditorBlockDescriptions.EditorConstant
      ]
    },
    {
      describedType: {
        languageName: "emptyBlocks",
        typeName: "a",
      },
      visual: [
        {
          blockType: "constant",
          text: "a"
        } as EditorBlockDescriptions.EditorConstant
      ]
    }
  ]
}

describe("LanguageModel", () => {
  it("Loads correctly", () => {
    const l = new LanguageModel(langEmptyBlocks);

    expect(l.missingEditorBlocks.length).toEqual(1);
    expect(l.missingEditorBlocks[0]).toEqual({ languageName: "emptyBlocks", typeName: "z" });
  });

  it("Constructing default root with children", () => {
    const l = new LanguageModel(langEmptyBlocks);

    const n = l.constructDefaultNode({ languageName: "emptyBlocks", typeName: "root" });
    expect(Object.keys(n.children)).toEqual(["cat_a"]);
  });

  it("Rejects to render a tree with only unknown types", () => {
    const l = new LanguageModel(langEmptyBlocks);
    const t = new Tree({
      language: "l",
      name: "n1"
    });

    expect(l.canRenderTree(t)).toBe(false);
  });

  it("Rejects to render a tree with only partially known types", () => {
    const l = new LanguageModel(langEmptyBlocks);
    const t = new Tree({
      language: "emptyBlocks",
      name: "root",
      children: {
        "bla": [
          { language: "l", name: "n1" }
        ]
      }
    });

    expect(l.canRenderTree(t)).toBe(false);
  });

  it("Promises to render a tree with only known types", () => {
    const l = new LanguageModel(langEmptyBlocks);
    const t = new Tree({
      language: "emptyBlocks",
      name: "root",
      children: {
        "bla": [
          { language: "emptyBlocks", name: "a" },
          { language: "emptyBlocks", name: "a" },
        ]
      }
    });

    expect(l.canRenderTree(t)).toBe(true);
  });
});
