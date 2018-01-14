import { Tree, LanguageDescription, Language } from 'app/shared/syntaxtree';

import { LanguageModelDescription } from './language-model.description'
import { LanguageModel } from './language-model'
import { SidebarBlockDescription, VisualBlockDescriptions } from './block.description'


const langEmptyBlocks: LanguageDescription = {
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
              nodeTypes: [{
                nodeType: "a",
                occurs: "+"
              }]
            }
          }
        },
        "a": {},
        "z": {}
      },
      root: "root"
    }
  ]
}

const langModelEmptyBlocks: LanguageModelDescription = {
  id: "emptyblocks",
  name: "Empty Blocks",
  sidebarBlocks: [
    {
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
        } as VisualBlockDescriptions.EditorConstant
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
        } as VisualBlockDescriptions.EditorConstant
      ]
    }
  ]
}

describe("LanguageModel", () => {
  it("Loads correctly", () => {
    const lm = new LanguageModel(langModelEmptyBlocks);
    const l = new Language(langEmptyBlocks);

    expect(lm.id).toEqual(langModelEmptyBlocks.id);
    expect(lm.name).toEqual(langModelEmptyBlocks.name);

    const missingEditorBlocks = lm.getMissingEditorBlocks(l);
    expect(missingEditorBlocks.length).toEqual(1);
    expect(missingEditorBlocks[0]).toEqual({ languageName: "emptyBlocks", typeName: "z" });

    expect(lm.availableSidebarBlocks.length).toEqual(2);
  });

  it("Constructing default root with children", () => {
    const lm = new LanguageModel(langModelEmptyBlocks);
    const l = new Language(langEmptyBlocks);

    const n = lm.constructDefaultNode(l, { languageName: "emptyBlocks", typeName: "root" });
    expect(Object.keys(n.children)).toEqual(["cat_a"]);
  });

  it("Rejects to render a tree with only unknown types", () => {
    const lm = new LanguageModel(langModelEmptyBlocks);
    const t = new Tree({
      language: "l",
      name: "n1"
    });

    expect(lm.canRenderTree(t)).toBe(false);
  });

  it("Rejects to render a tree with only partially known types", () => {
    const lm = new LanguageModel(langModelEmptyBlocks);
    const t = new Tree({
      language: "emptyBlocks",
      name: "root",
      children: {
        "bla": [
          { language: "l", name: "n1" }
        ]
      }
    });

    expect(lm.canRenderTree(t)).toBe(false);
  });

  it("Promises to render a tree with only known types", () => {
    const lm = new LanguageModel(langModelEmptyBlocks);
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

    expect(lm.canRenderTree(t)).toBe(true);
  });
});
