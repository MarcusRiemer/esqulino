import { GrammarDescription, NodeConcreteTypeDescription } from '../../syntaxtree/grammar.description'

import { VisualBlockDescriptions } from '../block.description';

import { BlockLanguageGeneratorDescription } from './generator.description'
import { convertGrammar, mapTerminal, mapProperty, mapChildren, mapType, mapAttributes } from './generator'
import { DefaultInstructions } from './instructions.description';
import { MultiBlockInstructions, SingleBlockInstructions } from './instructions';

describe("BlockLanguage Generator", () => {
  describe("Single Types", () => {

    it("Terminal => Constant", () => {
      const res = mapTerminal({ type: "terminal", name: "t", symbol: "t" }, { style: {} });
      expect(res).toEqual({ blockType: "constant", text: "t" });
    });

    it("Styled Terminal => Styled Constant", () => {
      const res = mapTerminal({ type: "terminal", name: "t", symbol: "t" }, { style: { color: "green" } });
      expect(res).toEqual({ blockType: "constant", text: "t", style: { color: "green" } });
    });

    it("Writeable Property => Input", () => {
      const res = mapProperty(
        { type: "property", name: "prop", base: "string" },
        { readOnly: false, style: {} }
      );
      expect(res).toEqual({ blockType: "input", property: "prop" });
    });

    it("Readonly Property => Interpolated", () => {
      const res = mapProperty(
        { type: "property", name: "prop", base: "string" },
        { readOnly: true, style: {} }
      );
      expect(res).toEqual({ blockType: "interpolated", property: "prop" });
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

      expect(res).toEqual([
        {
          blockType: "iterator",
          childGroupName: "c1",
          direction: DefaultInstructions.iteratorInstructions.orientation,
          wrapChildren: true
        }
      ]);
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
          style: {},
          generateDropTargets: "none"
        }
      );

      expect(res).toEqual([
        {
          blockType: "iterator",
          childGroupName: "c1",
          direction: "horizontal",
          wrapChildren: true,
          between: [
            {
              blockType: "constant",
              text: "ä",
              style: DefaultInstructions.terminalInstructions.style
            }
          ]
        }
      ]);
    });

    it("Mentioned attributes only", () => {
      const instr = new SingleBlockInstructions({
        type: "single",
        block: {
          attributeMapping: ["p1"]
        },
        attributes: {
          "p1": {}
        }
      });

      const concreteType: NodeConcreteTypeDescription = {
        type: "concrete",
        attributes: [
          { type: "property", name: "ignored", base: "string" },
          { type: "terminal", name: "p1", symbol: "p1Text", },
        ]
      };
      const res = mapAttributes(concreteType, instr);
      expect(res.length).toEqual(1);
    });

    it("Mentioning an unknown attribute", () => {
      const instr = new SingleBlockInstructions({
        type: "single",
        block: { attributeMapping: ["missing"] },
        attributes: {
          "missing": {}
        }
      });

      const concreteType: NodeConcreteTypeDescription = {
        type: "concrete",
        attributes: [
          { type: "property", name: "ignored", base: "string" },
          { type: "terminal", name: "p1", symbol: "p1Text", },
        ]
      };
      expect(() => mapAttributes(concreteType, instr)).toThrowError();
    });
  });

  describe("Multi Block Types", () => {
    it("Identical relevant terminals with ignored property", () => {
      const instructions = new MultiBlockInstructions({
        type: "multi",
        blocks: [
          {
            type: "single",
            block: { attributeMapping: ["p1"] },
            attributes: { "p1": {} }
          },
          {
            type: "single",
            block: { attributeMapping: ["p1"] },
            attributes: { "p1": {} }
          },
        ]
      });

      const concreteType: NodeConcreteTypeDescription = {
        type: "concrete",
        attributes: [
          {
            type: "property",
            name: "ignored",
            base: "string"
          },
          {
            type: "terminal",
            name: "p1",
            symbol: "p1Text",
          },
        ]
      }
      const res = mapType(concreteType, instructions) as VisualBlockDescriptions.EditorBlock[];
      expect(res.length).toEqual(2, "Two generated blocks");

      const expBlock = jasmine.objectContaining({
        blockType: "block",
      } as Partial<VisualBlockDescriptions.EditorBlock>);

      const expConstant = jasmine.objectContaining({
        blockType: "constant",
        text: "p1Text"
      } as Partial<VisualBlockDescriptions.EditorConstant>);

      res.forEach(b => {
        expect(b).toEqual(expBlock);
        expect(b.children.length).toEqual(1, "A single child");
        expect(b.children[0]).toEqual(expConstant);
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
