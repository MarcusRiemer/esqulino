import { Tree, LanguageDefinition, Language, NodeTypeDescription } from '../syntaxtree';

import { BlockLanguageDescription, isBlockLanguageDescription } from './block-language.description'
import { BlockLanguage } from './block-language'
import { VisualBlockDescriptions } from './block.description'

const langEmptyBlocks: LanguageDefinition = {
  id: "emptyBlocks",
  name: "emptyBlocks",
  emitters: [],
  validators: [
    {
      technicalName: "emptyBlocks",
      types: {
        "emptyBlocks": {
          "root": {
            attributes: [
              {
                name: "cat_a",
                type: "allowed",
                nodeTypes: [
                  {
                    nodeType: "a",
                    occurs: "+"
                  }
                ]
              }
            ]
          } as NodeTypeDescription,
          "a": {} as NodeTypeDescription,
          "z": {} as NodeTypeDescription
        },
      },
      root: { languageName: "emptyBlocks", typeName: "root" }
    }
  ]
}

const langModelEmptyBlocks: BlockLanguageDescription = {
  id: "emptyblocks",
  name: "Empty Blocks",
  slug: "emptyblocks",
  defaultProgrammingLanguageId: "emptyBlocks",
  editorComponents: [],
  sidebars: [
    {
      type: "fixedBlocks",
      caption: "Empty Blocks",
      categories: [
        {
          categoryCaption: "Empty Blocks",
          blocks: [
            {
              displayName: "Empty Root",
              defaultNode: {
                language: "emptyBlocks",
                name: "root",
                children: {
                  "cat_a": []
                }
              }
            },
            {
              displayName: "Empty a",
              defaultNode: {
                language: "emptyBlocks",
                name: "a"
              }
            }
          ]
        }
      ]
    },
    {
      type: "databaseSchema"
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

describe("Block Language", () => {
  it("identifies objects correctly", () => {
    expect(isBlockLanguageDescription(langModelEmptyBlocks)).toBe(true);
  });

  it("Loads correctly and hands out data", () => {
    const lm = new BlockLanguage(langModelEmptyBlocks);
    const l = new Language(langEmptyBlocks);

    expect(lm.id).toEqual(langModelEmptyBlocks.id);
    expect(lm.slug).toEqual(langModelEmptyBlocks.slug);
    expect(lm.name).toEqual(langModelEmptyBlocks.name);
    expect(lm.defaultProgrammingLanguageId).toEqual(langModelEmptyBlocks.defaultProgrammingLanguageId);

    const missingEditorBlocks = lm.getMissingEditorBlocks(l);
    expect(missingEditorBlocks.length).toEqual(1);
    expect(missingEditorBlocks[0]).toEqual({ languageName: "emptyBlocks", typeName: "z" });

    expect(lm.sidebars.length).toEqual(2);
    expect(lm.hasMultipleSidebars).toBeTruthy();

    expect(lm.getEditorBlock({ languageName: "emptyBlocks", typeName: "a" })).toBeTruthy();
    expect(() => { lm.getEditorBlock({ languageName: "x", typeName: "x" }) }).toThrowError();
  });

  it("Rejects to render a tree with only unknown types", () => {
    const lm = new BlockLanguage(langModelEmptyBlocks);
    const t = new Tree({
      language: "l",
      name: "n1"
    });

    expect(lm.canRenderTree(t)).toBe(false);
  });

  it("Rejects to render a tree with only partially known types", () => {
    const lm = new BlockLanguage(langModelEmptyBlocks);
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
    const lm = new BlockLanguage(langModelEmptyBlocks);
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
