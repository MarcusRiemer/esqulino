import { GrammarDocument } from '../../syntaxtree/grammar.description'
import { singleLanguageGrammar } from '../../syntaxtree/grammar.spec-util';

import { convertGrammarTreeInstructions } from './generator-tree';
import { readableConstants } from './spec-util';

describe("Tree BlockLanguage Generator", () => {
  describe("Whole Grammars", () => {
    it("Root node without attributes", () => {
      const grammar: GrammarDocument = singleLanguageGrammar("g1", "t1", {
        "t1": {
          type: "concrete",
          attributes: []
        }
      });

      const r = convertGrammarTreeInstructions({ "type": "tree" }, grammar);

      expect(r.editorBlocks).not.toEqual([]);
      expect(readableConstants(r.editorBlocks[0].visual))
        .toEqual(`<block><container>node "t1" {}</container></block>`);
      expect(r.editorBlocks[0]).toEqual(jasmine.objectContaining({
        describedType: { languageName: "g1", typeName: "t1" },
      }));
    });

    it("Root node with single property", () => {
      const grammar: GrammarDocument = singleLanguageGrammar("g1", "t1", {
        "t1": {
          type: "concrete",
          attributes: [
            {
              type: "property",
              name: "p1",
              base: "string"
            }
          ]
        }
      });

      const r = convertGrammarTreeInstructions({ "type": "tree" }, grammar);

      expect(r.editorBlocks)
        .not.toEqual([]);
      expect(readableConstants(r.editorBlocks[0].visual))
        .toEqual(`<block><container>node "t1" {<container class="indent vertical"><container class="horizontal">prop "p1": </container></container>}</container></block>`);
      expect(r.editorBlocks[0])
        .toEqual(jasmine.objectContaining({ describedType: { languageName: "g1", typeName: "t1" } }));
    });

    it("Reads over terminals", () => {
      const grammar: GrammarDocument = singleLanguageGrammar("g1", "t1", {
        "t1": {
          type: "concrete",
          attributes: [
            {
              type: "terminal",
              name: "p1",
              symbol: "t"
            },
            {
              type: "property",
              name: "p1",
              base: "string"
            }
          ]
        }
      });

      const r = convertGrammarTreeInstructions({ "type": "tree" }, grammar);

      expect(r.editorBlocks)
        .not.toEqual([]);
      expect(readableConstants(r.editorBlocks[0].visual))
        .toEqual(`<block><container>node "t1" {<container class="indent vertical"><container class="horizontal">prop "p1": </container></container>}</container></block>`);
      expect(r.editorBlocks[0])
        .toEqual(jasmine.objectContaining({ describedType: { languageName: "g1", typeName: "t1" } }));
    });

    it("Goes into parentheses", () => {
      const grammar: GrammarDocument = singleLanguageGrammar("g1", "t1", {
        "t1": {
          type: "concrete",
          attributes: [
            {
              type: "parentheses",
              name: "p1",
              cardinality: "+",
              group: {
                nodeTypes: ["t2", "t3"],
                type: "allowed"
              }
            }
          ]
        },
        "t2": {
          type: "concrete",
          attributes: []
        },
        "t3": {
          type: "concrete",
          attributes: []
        }
      });

      const r = convertGrammarTreeInstructions({ "type": "tree" }, grammar);

      expect(r.editorBlocks)
        .not.toEqual([]);
      expect(readableConstants(r.editorBlocks[0].visual))
        .toEqual(`<block><container>node "t1" {<container class="indent vertical"><container class="vertical">children parentheses "p1" : [<iterator childGroup="p1">]</container></container>}</container></block>`);
      expect(r.editorBlocks[0])
        .toEqual(jasmine.objectContaining({ describedType: { languageName: "g1", typeName: "t1" } }));
    });
  });
});