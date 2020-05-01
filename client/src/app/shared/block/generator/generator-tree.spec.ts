import {
  GrammarDocument,
  NodeAttributeDescription,
} from "../../syntaxtree/grammar.description";
import { singleLanguageGrammar } from "../../syntaxtree/grammar.spec-util";

import {
  convertGrammarTreeInstructions,
  gatherAttributes,
} from "./generator-tree";
import { readableConstants } from "./spec-util";

describe("Tree BlockLanguage Generator", () => {
  describe("gatherAttributes", () => {
    it(`[]`, () => {
      const res = gatherAttributes([]);
      expect(res).toEqual([]);
    });

    it(`[property]`, () => {
      const p1: NodeAttributeDescription = {
        type: "property",
        name: "p",
        base: "integer",
      };
      const res = gatherAttributes([p1]);
      expect(res).toEqual([p1]);
    });
    it(`[property,terminal]`, () => {
      const p1: NodeAttributeDescription = {
        type: "property",
        name: "p",
        base: "integer",
      };
      const p2: NodeAttributeDescription = {
        type: "terminal",
        symbol: "irrelevant",
      };
      const res = gatherAttributes([p1, p2]);
      expect(res).toEqual([p1]);
    });
    it(`[property,container([property])]`, () => {
      const p1: NodeAttributeDescription = {
        type: "property",
        name: "p1",
        base: "integer",
      };
      const p2_1: NodeAttributeDescription = {
        type: "property",
        name: "p2_1",
        base: "integer",
      };
      const p2: NodeAttributeDescription = {
        type: "container",
        orientation: "vertical",
        children: [p2_1],
      };
      const res = gatherAttributes([p1, p2]);
      expect(res).toEqual([p1, p2_1]);
    });
    it(`[container([property]),property]`, () => {
      const p1_1: NodeAttributeDescription = {
        type: "property",
        name: "p1_1",
        base: "integer",
      };
      const p1: NodeAttributeDescription = {
        type: "container",
        orientation: "vertical",
        children: [p1_1],
      };
      const p2: NodeAttributeDescription = {
        type: "property",
        name: "p1",
        base: "integer",
      };
      const res = gatherAttributes([p1, p2]);
      expect(res).toEqual([p1_1, p2]);
    });
    it(`[container([property,terminal,property])]`, () => {
      const p1_1: NodeAttributeDescription = {
        type: "property",
        name: "p1_1",
        base: "integer",
      };
      const p1_2: NodeAttributeDescription = {
        type: "terminal",
        symbol: "irrelevant",
      };
      const p1_3: NodeAttributeDescription = {
        type: "property",
        name: "p1_3",
        base: "integer",
      };
      const p1: NodeAttributeDescription = {
        type: "container",
        orientation: "vertical",
        children: [p1_1, p1_2, p1_3],
      };
      const res = gatherAttributes([p1]);
      expect(res).toEqual([p1_1, p1_3]);
    });
  });

  describe("Whole Grammars", () => {
    it("Root node without attributes", () => {
      const grammar: GrammarDocument = singleLanguageGrammar("g1", "t1", {
        t1: {
          type: "concrete",
          attributes: [],
        },
      });

      const r = convertGrammarTreeInstructions({ type: "tree" }, grammar);

      expect(r.editorBlocks).not.toEqual([]);
      expect(readableConstants(r.editorBlocks[0].visual)).toEqual(
        `<block><container class="vertical"><container class="horizontal">node "t1" {</container>}</container></block>`
      );
      expect(r.editorBlocks[0]).toEqual(
        jasmine.objectContaining({
          describedType: { languageName: "g1", typeName: "t1" },
        })
      );
    });

    it("Root node with single property", () => {
      const grammar: GrammarDocument = singleLanguageGrammar("g1", "t1", {
        t1: {
          type: "concrete",
          attributes: [
            {
              type: "property",
              name: "p1",
              base: "string",
            },
          ],
        },
      });

      const r = convertGrammarTreeInstructions({ type: "tree" }, grammar);

      expect(r.editorBlocks).not.toEqual([]);
      expect(readableConstants(r.editorBlocks[0].visual)).toEqual(
        `<block><container class="vertical"><container class="horizontal">node "t1" {</container><container class="indent vertical"><container class="horizontal">prop "p1": </container></container>}</container></block>`
      );
      expect(r.editorBlocks[0]).toEqual(
        jasmine.objectContaining({
          describedType: { languageName: "g1", typeName: "t1" },
        })
      );
    });

    it("Reads over terminals", () => {
      const grammar: GrammarDocument = singleLanguageGrammar("g1", "t1", {
        t1: {
          type: "concrete",
          attributes: [
            {
              type: "terminal",
              name: "p1",
              symbol: "t",
            },
            {
              type: "property",
              name: "p1",
              base: "string",
            },
          ],
        },
      });

      const r = convertGrammarTreeInstructions({ type: "tree" }, grammar);

      expect(r.editorBlocks).not.toEqual([]);
      expect(readableConstants(r.editorBlocks[0].visual)).toEqual(
        `<block><container class="vertical"><container class="horizontal">node "t1" {</container><container class="indent vertical"><container class="horizontal">prop "p1": </container></container>}</container></block>`
      );
      expect(r.editorBlocks[0]).toEqual(
        jasmine.objectContaining({
          describedType: { languageName: "g1", typeName: "t1" },
        })
      );
    });

    it("Goes into parentheses", () => {
      const grammar: GrammarDocument = singleLanguageGrammar("g1", "t1", {
        t1: {
          type: "concrete",
          attributes: [
            {
              type: "parentheses",
              name: "p1",
              cardinality: "+",
              group: {
                nodeTypes: ["t2", "t3"],
                type: "allowed",
              },
            },
          ],
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

      const r = convertGrammarTreeInstructions({ type: "tree" }, grammar);

      expect(r.editorBlocks).not.toEqual([]);
      expect(readableConstants(r.editorBlocks[0].visual)).toEqual(
        `<block><container class="vertical"><container class="horizontal">node "t1" {</container><container class="indent vertical"><container class="vertical"><container class="horizontal">children parentheses "p1" : [</container><container class="indent vertical"><iterator childGroup="p1"></container>]</container></container>}</container></block>`
      );
      expect(r.editorBlocks[0]).toEqual(
        jasmine.objectContaining({
          describedType: { languageName: "g1", typeName: "t1" },
        })
      );
    });
  });
});
