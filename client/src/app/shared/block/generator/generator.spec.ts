import { GrammarDescription } from '../../syntaxtree/grammar.description'

import { VisualBlockDescriptions } from '../block.description';

import { BlockLanguageGeneratorDescription } from './generator.description'
import { convertGrammar, mapTerminal, mapProperty, mapChildren } from './generator'
import { DefaultInstructions } from './instructions.description';

describe("BlockLanguage Generator", () => {
  describe("Single Types", () => {

    it("Terminal => Constant", () => {
      const res = mapTerminal({ type: "terminal", symbol: "t" }, { style: {} });
      expect(res).toEqual({ blockType: "constant", text: "t" });
    });

    it("Styled Terminal => Styled Constant", () => {
      const res = mapTerminal({ type: "terminal", symbol: "t" }, { style: { color: "green" } });
      expect(res).toEqual({ blockType: "constant", text: "t", style: { color: "green" } });
    });

    it("Property => Input", () => {
      const res = mapProperty({ type: "property", name: "prop", base: "string" }, { style: {} });
      expect(res).toEqual({ blockType: "input", property: "prop" });
    });

    it("Sequence => Iterator", () => {
      const res = mapChildren(
        {
          type: "sequence",
          name: "c1",
          nodeTypes: []
        },
        DefaultInstructions.iteratorInstructions
      );

      expect(res).toEqual({
        blockType: "iterator",
        childGroupName: "c1",
        direction: DefaultInstructions.iteratorInstructions.orientation
      });
    });

    it("Sequence (+Between) => Iterator", () => {
      const res = mapChildren(
        {
          type: "sequence",
          name: "c1",
          nodeTypes: []
        },
        {
          orientation: "horizontal",
          between: "ä",
          style: {}
        }
      );

      expect(res).toEqual({
        blockType: "iterator",
        childGroupName: "c1",
        direction: "horizontal",
        between: [
          {
            blockType: "constant",
            text: "ä",
            style: DefaultInstructions.terminalInstructions.style
          }
        ]
      });
    });
  });

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

    it("Terminal symbols to constants", () => {
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
                symbol: "t"
              }
            ]
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
      const b = r.editorBlocks[0].visual[0] as VisualBlockDescriptions.EditorBlock;
      const v = b.children[0] as VisualBlockDescriptions.EditorConstant;
      expect(v.blockType).toEqual("constant");
      expect(v.text).toEqual("t");
    });
  });
});
