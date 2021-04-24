import { GrammarDocument } from "../../syntaxtree/grammar.description";
import {
  mkGrammarDoc,
  mkSingleLanguageGrammar,
} from "../../syntaxtree/grammar.spec-util";

import { VisualBlockDescriptions } from "../block.description";
import { BlockLanguageDocument } from "../block-language.description";

import { BlockLanguageGeneratorDocument } from "./generator.description";
import { convertGrammarManualInstructions } from "./generator-manual";

/**
 * More comfortable access to mapped attributes
 */
function expectMappedAttribute(
  r: BlockLanguageDocument,
  blockIndex: number,
  visualIndex: number
) {
  const block = r.editorBlocks[blockIndex];
  expect(block).toBeDefined();
  const visualBlock = block.visual[0] as VisualBlockDescriptions.EditorBlock;
  expect(visualBlock).toBeDefined();
  expect(VisualBlockDescriptions.isEditorBlock(visualBlock)).toBe(true);
  const visual = visualBlock.children[visualIndex + 1]; // Skip error block

  return visual;
}

describe("Manual BlockLanguage Generator", () => {
  describe("Whole Grammars", () => {
    it("Grammar with only unnamed terminal symbols", () => {
      const grammar: GrammarDocument = mkSingleLanguageGrammar("g1", "t1", {
        t1: {
          type: "concrete",
          attributes: [{ type: "terminal", symbol: "t" }],
        },
      });

      const generator: BlockLanguageGeneratorDocument = {
        type: "manual",
        editorComponents: [],
      };

      const r = convertGrammarManualInstructions(generator, grammar);

      expect(r.editorBlocks.length).toEqual(1);

      const v = expectMappedAttribute(r, 0, 0);
      expect(v.blockType).toEqual("constant");
    });

    it("Grammar with unnamed container", () => {
      const grammar: GrammarDocument = mkSingleLanguageGrammar("g1", "t1", {
        t1: {
          type: "concrete",
          attributes: [
            {
              type: "container",
              children: [{ type: "terminal", symbol: "t" }],
              orientation: "horizontal",
            },
          ],
        },
      });

      const generator: BlockLanguageGeneratorDocument = {
        type: "manual",
        editorComponents: [],
      };

      const r = convertGrammarManualInstructions(generator, grammar);

      expect(r.editorBlocks.length).toEqual(1);

      const c = expectMappedAttribute(
        r,
        0,
        0
      ) as VisualBlockDescriptions.EditorContainer;
      expect(c.blockType).toEqual("container");
      expect(c.orientation).toEqual("horizontal");
      expect(c.children.length).toEqual(1);
    });

    it("Grammar with unnamed container that has custom tags", () => {
      const grammar: GrammarDocument = mkSingleLanguageGrammar("g1", "t1", {
        t1: {
          type: "concrete",
          attributes: [
            {
              type: "container",
              children: [{ type: "terminal", symbol: "t" }],
              orientation: "horizontal",
              tags: ["foo"],
            },
          ],
        },
      });

      const generator: BlockLanguageGeneratorDocument = {
        type: "manual",
        editorComponents: [],
      };

      const r = convertGrammarManualInstructions(generator, grammar);

      expect(r.editorBlocks.length).toEqual(1);

      const c = expectMappedAttribute(
        r,
        0,
        0
      ) as VisualBlockDescriptions.EditorContainer;
      expect(c.blockType).toEqual("container");
      expect(c.orientation).toEqual("horizontal");
      expect(c.cssClasses).toEqual(["foo"]);
      expect(c.children.length).toEqual(1);
    });

    it("Grammar with foreign empty node that is visualized with unnamed terminal symbols", () => {
      const grammar: GrammarDocument = mkGrammarDoc(
        { languageName: "g1", typeName: "t1" },
        {
          visualisations: {
            g1: {
              t1: {
                type: "visualise",
                attributes: [{ type: "terminal", symbol: "t1" }],
              },
            },
          },
          foreignTypes: {
            g1: {
              t1: {
                type: "concrete",
                attributes: [],
              },
            },
          },
        }
      );

      const generator: BlockLanguageGeneratorDocument = {
        type: "manual",
        editorComponents: [],
      };

      const r = convertGrammarManualInstructions(generator, grammar);

      expect(r.editorBlocks.length).toEqual(1);

      const v = expectMappedAttribute(r, 0, 0);
      expect(v.blockType).toEqual("constant");
    });

    it("Grammar with multiple unnamed containers for a single block", () => {
      const grammar: GrammarDocument = mkSingleLanguageGrammar("g1", "t1", {
        t1: {
          type: "concrete",
          attributes: [
            {
              type: "container",
              children: [
                { type: "terminal", symbol: "1" },
                { type: "terminal", symbol: "2" },
              ],
              orientation: "horizontal",
            },
            {
              type: "container",
              children: [{ type: "property", name: "i1", base: "integer" }],
              orientation: "vertical",
            },
          ],
        },
      });

      const generator: BlockLanguageGeneratorDocument = {
        type: "manual",
        editorComponents: [],
      };

      const r = convertGrammarManualInstructions(generator, grammar);

      expect(r.editorBlocks.length).toEqual(1);

      const c1 = expectMappedAttribute(
        r,
        0,
        0
      ) as VisualBlockDescriptions.EditorContainer;
      expect(c1.blockType).toEqual("container");
      expect(c1.orientation).toEqual("horizontal");
      expect(c1.children.length).toEqual(2);
      expect(c1.children[0].blockType).toEqual("constant");

      const c2 = expectMappedAttribute(
        r,
        0,
        1
      ) as VisualBlockDescriptions.EditorContainer;
      expect(c2.blockType).toEqual("container");
      expect(c2.orientation).toEqual("vertical");
      expect(c2.children.length).toEqual(1);
      expect(c2.children[0].blockType).toEqual("input");
    });

    it("Almost empty grammar with no generation instructions", () => {
      const grammar: GrammarDocument = mkSingleLanguageGrammar("g1", "t1", {
        t1: {
          type: "concrete",
          attributes: [],
        },
      });

      const generator: BlockLanguageGeneratorDocument = {
        type: "manual",
        editorComponents: [],
      };

      const r = convertGrammarManualInstructions(generator, grammar);

      expect(r.editorBlocks.length).toEqual(1);
    });

    it("Almost empty grammar with parametrized instructions and missing values", () => {
      const grammar: GrammarDocument = mkSingleLanguageGrammar("g1", "t1", {
        t1: {
          type: "concrete",
          attributes: [
            { type: "property", name: "p1", base: "string" },
            { type: "terminal", name: "t1", symbol: "t1" },
          ],
        },
      });

      const generator: BlockLanguageGeneratorDocument = {
        type: "manual",
        editorComponents: [],
        parameterDeclarations: {
          allowModifications: { type: { type: "boolean" } },
        },
        typeInstructions: {
          g1: {
            t1: {
              attributes: {
                p1: {
                  propReadOnly: { $ref: "missing" },
                },
              },
            },
          },
        },
      };

      expect(() =>
        convertGrammarManualInstructions(generator, grammar)
      ).toThrowError();
    });

    it("Almost empty grammar with two blocks for a single type", () => {
      const grammar: GrammarDocument = mkSingleLanguageGrammar("g1", "t1", {
        t1: {
          type: "concrete",
          attributes: [
            { type: "property", name: "p1", base: "string" },
            { type: "terminal", name: "t1", symbol: "t1" },
          ],
        },
      });

      const generator: BlockLanguageGeneratorDocument = {
        type: "manual",
        editorComponents: [],
        typeInstructions: {
          g1: {
            t1: {
              blocks: [
                { attributeMapping: ["t1"] },
                { attributeMapping: ["p1"] },
              ],
            },
          },
        },
      };

      const blockLang = convertGrammarManualInstructions(generator, grammar);
      expect(blockLang.editorBlocks.length).toEqual(1);

      const visualBlock = blockLang.editorBlocks[0];
      expect(visualBlock.visual.length).toEqual(2);
      expect(visualBlock.visual[0].blockType).toEqual("block");
      expect(visualBlock.visual[1].blockType).toEqual("block");

      const blockTerminal = visualBlock
        .visual[0] as VisualBlockDescriptions.EditorBlock;
      expect(blockTerminal.children.length).toEqual(2);
      expect(blockTerminal.children[0].blockType).toEqual("error");
      expect(blockTerminal.children[1].blockType).toEqual("constant");
    });

    it("Almost empty grammar with one partial block for a single type", () => {
      const grammar: GrammarDocument = mkSingleLanguageGrammar("g1", "t1", {
        t1: {
          type: "concrete",
          attributes: [
            { type: "property", name: "p1", base: "string" },
            { type: "terminal", name: "t1", symbol: "t1" },
          ],
        },
      });

      const generator: BlockLanguageGeneratorDocument = {
        type: "manual",
        editorComponents: [],
        typeInstructions: {
          g1: {
            t1: {
              blocks: [{ attributeMapping: ["t1"] }],
            },
          },
        },
      };

      const blockLang = convertGrammarManualInstructions(generator, grammar);
      expect(blockLang.editorBlocks.length).toEqual(1);

      const visualBlock = blockLang.editorBlocks[0];
      expect(visualBlock.visual.length).toEqual(1);
      expect(visualBlock.visual[0].blockType).toEqual("block");

      const blockTerminal = visualBlock
        .visual[0] as VisualBlockDescriptions.EditorBlock;
      expect(blockTerminal.children.length).toEqual(2);
      expect(blockTerminal.children[0].blockType).toEqual("error");
      expect(blockTerminal.children[1].blockType).toEqual("constant");
    });

    it("Almost empty grammar with parametrized instructions and supplied values", () => {
      const grammar: GrammarDocument = mkSingleLanguageGrammar("g1", "t1", {
        t1: {
          type: "concrete",
          attributes: [
            { type: "property", name: "p1", base: "string" },
            { type: "terminal", name: "t1", symbol: "t1" },
          ],
        },
      });

      const generator: BlockLanguageGeneratorDocument = {
        type: "manual",
        editorComponents: [],
        parameterDeclarations: {
          allowModifications: { type: { type: "boolean" } },
        },
        parameterValues: {
          allowModifications: true,
        },
        typeInstructions: {
          g1: {
            t1: {
              attributes: {
                p1: {
                  propReadOnly: { $ref: "allowModifications" },
                },
              },
            },
          },
        },
      };

      const b = convertGrammarManualInstructions(generator, grammar);
      expect(b.editorBlocks.length).toEqual(1);

      type Interpoloated = VisualBlockDescriptions.EditorInterpolated;
      const t1Block = b.editorBlocks[0]
        .visual[0] as VisualBlockDescriptions.EditorBlock;
      expect(t1Block.blockType).toEqual("block");

      // First autogenerated block is for errors
      expect(t1Block.children[0]).toEqual(
        jasmine.objectContaining({
          blockType: "error",
        } as Partial<VisualBlockDescriptions.EditorErrorIndicator>)
      );

      // Then the actual block
      expect(t1Block.children[1]).toEqual(
        jasmine.objectContaining<Interpoloated>({
          blockType: "interpolated",
          property: "p1",
        })
      );
    });

    it("No blocks for 'oneOf'-types", () => {
      const grammar: GrammarDocument = mkSingleLanguageGrammar("g1", "t1", {
        t1: {
          type: "oneOf",
          oneOf: ["t2", "t3"],
        },
        t2: {
          type: "concrete",
          attributes: [],
        },
        t3: {
          type: "concrete",
          attributes: [],
        },
      });

      const generator: BlockLanguageGeneratorDocument = {
        type: "manual",
        editorComponents: [],
      };

      const r = convertGrammarManualInstructions(generator, grammar);

      expect(r.editorBlocks.length).toEqual(2);
    });

    it("All iterators, a constant and a property", () => {
      const grammar: GrammarDocument = mkSingleLanguageGrammar("g1", "t1", {
        t1: {
          type: "concrete",
          attributes: [
            {
              type: "terminal",
              name: "t",
              symbol: "t",
            },
            {
              type: "allowed",
              name: "c1",
              nodeTypes: [
                {
                  nodeType: "t1",
                  occurs: "1",
                },
              ],
            },
            {
              type: "sequence",
              name: "c2",
              nodeTypes: [
                {
                  nodeType: "t1",
                  occurs: "1",
                },
              ],
            },
            {
              type: "choice",
              name: "c3",
              choices: ["t1"],
            },
            {
              type: "property",
              name: "p1",
              base: "string",
            },
          ],
        },
      });

      const generator: BlockLanguageGeneratorDocument = {
        type: "manual",
        editorComponents: [],
      };

      const r = convertGrammarManualInstructions(generator, grammar);

      // There should be exactly 1 block
      expect(r.editorBlocks.length).toEqual(1);
      const b = r.editorBlocks[0]
        .visual[0] as VisualBlockDescriptions.EditorBlock;
      expect(b).toEqual(
        jasmine.objectContaining({
          blockType: "block",
        } as Partial<VisualBlockDescriptions.EditorBlock>)
      );

      // First autogenerated block is for errors
      expect(b.children[0]).toEqual(
        jasmine.objectContaining({
          blockType: "error",
        } as Partial<VisualBlockDescriptions.EditorErrorIndicator>)
      );

      // First real block is the constant
      expect(b.children[1]).toEqual(
        jasmine.objectContaining({
          blockType: "constant",
          text: "t",
        } as Partial<VisualBlockDescriptions.EditorConstant>)
      );

      // The next three blocks are iterators

      // #1
      expect(b.children[2]).toEqual(
        jasmine.objectContaining({
          blockType: "iterator",
          childGroupName: "c1",
        } as Partial<VisualBlockDescriptions.EditorIterator>)
      );

      // #2
      expect(b.children[3]).toEqual(
        jasmine.objectContaining({
          blockType: "iterator",
          childGroupName: "c2",
        } as Partial<VisualBlockDescriptions.EditorIterator>)
      );

      // #3
      expect(b.children[4]).toEqual(
        jasmine.objectContaining({
          blockType: "iterator",
          childGroupName: "c3",
        } as Partial<VisualBlockDescriptions.EditorIterator>)
      );

      // And then we have a property
      expect(b.children[5]).toEqual(
        jasmine.objectContaining({
          blockType: "input",
          property: "p1",
        } as Partial<VisualBlockDescriptions.EditorInput>)
      );
    });
  });

  it("Practical Sample: DXML", () => {
    const grammar: GrammarDocument = mkGrammarDoc(
      { languageName: "dxml", typeName: "element" },
      {
        types: {},
        foreignTypes: {
          dxml: {
            text: {
              type: "concrete",
              attributes: [{ base: "string", name: "value", type: "property" }],
            },
            element: {
              type: "concrete",
              attributes: [
                { base: "string", name: "name", type: "property" },
                {
                  name: "attributes",
                  type: "sequence",
                  nodeTypes: [
                    {
                      occurs: "*",
                      nodeType: { typeName: "attribute", languageName: "dxml" },
                    },
                  ],
                },
                {
                  name: "elements",
                  type: "sequence",
                  nodeTypes: [
                    {
                      occurs: "*",
                      nodeType: { typeName: "text", languageName: "dxml" },
                    },
                    {
                      occurs: "*",
                      nodeType: { typeName: "element", languageName: "dxml" },
                    },
                  ],
                },
              ],
            },
            attribute: {
              type: "concrete",
              attributes: [
                { base: "string", name: "name", type: "property" },
                { base: "string", name: "value", type: "property" },
              ],
            },
          },
        },
        visualisations: {},
        foreignVisualisations: {},
      }
    );

    const generator: BlockLanguageGeneratorDocument = {
      type: "manual",
      editorComponents: [],
    };

    const r = convertGrammarManualInstructions(generator, grammar);

    expect(r.editorBlocks.length).toEqual(3);
  });
});
