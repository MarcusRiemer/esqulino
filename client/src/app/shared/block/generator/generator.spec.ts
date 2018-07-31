import { GrammarDescription } from '../../syntaxtree/grammar.description'

import { VisualBlockDescriptions } from '../block.description';

import { BlockLanguageGeneratorDescription } from './generator.description'
import { convertGrammar } from './generator'

describe("BlockLanguage Generator", () => {
  describe("Whole Grammars", () => {
    it("Almost empty grammar with no generation instructions", () => {
      const grammar: GrammarDescription = {
        id: "008f7fc3-f9a9-4ba3-932d-e7563ef7b31a",
        programmingLanguageId: "spec",
        name: "g1",
        root: "t1",
        types: {
          "t1": {
            type: "concrete",
            attributes: []
          }
        }
      };

      const generator: BlockLanguageGeneratorDescription = {
        id: "4d67a9d5-c47a-418a-a16c-5764fb20fab5",
        name: "Generating b1",
        editorComponents: []
      };

      const r = convertGrammar(generator, grammar);

      expect(r.editorBlocks.length).toEqual(1);
    });

    it("Almost empty grammar with parametrized instructions and missing values", () => {
      const grammar: GrammarDescription = {
        id: "008f7fc3-f9a9-4ba3-932d-e7563ef7b31a",
        programmingLanguageId: "spec",
        name: "g1",
        root: "t1",
        types: {
          "t1": {
            type: "concrete",
            attributes: [
              { type: "property", name: "p1", base: "string" },
              { type: "terminal", name: "t1", symbol: "t1" }
            ]
          }
        }
      };

      const generator: BlockLanguageGeneratorDescription = {
        id: "4d67a9d5-c47a-418a-a16c-5764fb20fab5",
        name: "Generating b1",
        editorComponents: [],
        parameterDeclarations: {
          "allowModifications": { "type": { "type": "boolean" } }
        },
        typeInstructions: {
          "g1": {
            "t1": {
              attributes: {
                "p1": {
                  readOnly: { $ref: "missing" }
                }
              }
            }
          }
        }
      };

      expect(() => convertGrammar(generator, grammar)).toThrowError();
    });

    it("Almost empty grammar with parametrized instructions and supplied values", () => {
      const grammar: GrammarDescription = {
        id: "008f7fc3-f9a9-4ba3-932d-e7563ef7b31a",
        programmingLanguageId: "spec",
        name: "g1",
        root: "t1",
        types: {
          "t1": {
            type: "concrete",
            attributes: [
              { type: "property", name: "p1", base: "string" },
              { type: "terminal", name: "t1", symbol: "t1" }
            ]
          }
        }
      };

      const generator: BlockLanguageGeneratorDescription = {
        id: "4d67a9d5-c47a-418a-a16c-5764fb20fab5",
        name: "Generating b1",
        editorComponents: [],
        parameterDeclarations: {
          "allowModifications": { "type": { "type": "boolean" } }
        },
        parameterValues: {
          "allowModifications": true
        },
        typeInstructions: {
          "g1": {
            "t1": {
              attributes: {
                "p1": {
                  readOnly: { $ref: "allowModifications" }
                }
              }
            }
          }
        }
      };

      const b = convertGrammar(generator, grammar);
      expect(b.editorBlocks.length).toEqual(1);

      type Interpoloated = VisualBlockDescriptions.EditorInterpolated;
      const t1Block = b.editorBlocks[0].visual[0] as VisualBlockDescriptions.EditorBlock;
      expect(t1Block.blockType).toEqual("block");
      expect(t1Block.children[0]).toEqual(jasmine.objectContaining<Interpoloated>({
        "blockType": "interpolated",
        "property": "p1"
      }));
    });

    it("No blocks for 'oneOf'-types", () => {
      const grammar: GrammarDescription = {
        id: "008f7fc3-f9a9-4ba3-932d-e7563ef7b31a",
        programmingLanguageId: "spec",
        name: "g1",
        root: "t1",
        types: {
          "t1": {
            type: "oneOf",
            oneOf: ["t2", "t3"]
          },
          "t2": {
            type: "concrete",
            attributes: []
          },
          "t3": {
            type: "concrete",
            attributes: []
          }
        }
      };

      const generator: BlockLanguageGeneratorDescription = {
        id: "cb90746a-887b-40a9-a53b-8a742b5436f3",
        name: "Generating b1",
        editorComponents: [],
      };

      const r = convertGrammar(generator, grammar);

      expect(r.editorBlocks.length).toEqual(2);
    });

    it("All iterators, a constant and a property", () => {
      const grammar: GrammarDescription = {
        id: "008f7fc3-f9a9-4ba3-932d-e7563ef7b31a",
        programmingLanguageId: "spec",
        name: "g1",
        root: "t1",
        types: {
          "t1": {
            type: "concrete",
            attributes: [
              {
                type: "terminal",
                name: "t",
                symbol: "t"
              },
              {
                type: "allowed",
                name: "c1",
                nodeTypes: [
                  {
                    nodeType: "t1",
                    occurs: "1"
                  }
                ]
              },
              {
                type: "sequence",
                name: "c2",
                nodeTypes: [
                  {
                    nodeType: "t1",
                    occurs: "1"
                  }
                ]
              },
              {
                type: "choice",
                name: "c3",
                choices: ["t1"]
              },
              {
                type: "property",
                name: "p1",
                base: "string"
              }
            ]
          },
        }
      };

      const generator: BlockLanguageGeneratorDescription = {
        id: "4d67a9d5-c47a-418a-a16c-5764fb20fab5",
        name: "Generating b1",
        editorComponents: []
      };

      const r = convertGrammar(generator, grammar);

      // There should be exactly 1 block
      expect(r.editorBlocks.length).toEqual(1);
      const b = r.editorBlocks[0].visual[0] as VisualBlockDescriptions.EditorBlock;
      expect(b).toEqual(jasmine.objectContaining({
        "blockType": "block"
      } as Partial<VisualBlockDescriptions.EditorBlock>));

      // First block is the constant
      expect(b.children[0]).toEqual(jasmine.objectContaining({
        blockType: "constant",
        text: "t"
      } as Partial<VisualBlockDescriptions.EditorConstant>));

      // The next three blocks are iterators
      expect(b.children[1]).toEqual(jasmine.objectContaining({
        blockType: "iterator",
        childGroupName: "c1"
      } as Partial<VisualBlockDescriptions.EditorIterator>));
      expect(b.children[2]).toEqual(jasmine.objectContaining({
        blockType: "iterator",
        childGroupName: "c2"
      } as Partial<VisualBlockDescriptions.EditorIterator>));
      expect(b.children[3]).toEqual(jasmine.objectContaining({
        blockType: "iterator",
        childGroupName: "c3"
      } as Partial<VisualBlockDescriptions.EditorIterator>));

      // And then we have a property
      expect(b.children[4]).toEqual(jasmine.objectContaining({
        blockType: "input",
        property: "p1"
      } as Partial<VisualBlockDescriptions.EditorInput>));
    });
  });
});
