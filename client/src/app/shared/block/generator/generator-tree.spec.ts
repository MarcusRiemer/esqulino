import { GrammarDocument } from '../../syntaxtree/grammar.description'

import { convertGrammarTreeInstructions } from './generator-tree';
import { readableConstants } from './spec-util';

describe("Tree BlockLanguage Generator", () => {
  describe("Whole Grammars", () => {
    it("Root node without attributes", () => {
      const grammar: GrammarDocument = {
        technicalName: "g1",
        root: "t1",
        types: {
          "t1": {
            type: "concrete",
            attributes: []
          }
        }
      };

      const r = convertGrammarTreeInstructions({ "type": "tree" }, grammar);

      expect(r.editorBlocks).not.toEqual([]);
      expect(readableConstants(r.editorBlocks[0].visual)).toEqual(`<block>node "t1" {}</block>`);
      expect(r.editorBlocks[0]).toEqual(jasmine.objectContaining({
        describedType: { languageName: "g1", typeName: "t1" },
      }));
    });

    it("Root node with single property", () => {
      const grammar: GrammarDocument = {
        technicalName: "g1",
        root: "t1",
        types: {
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
        }
      };

      const r = convertGrammarTreeInstructions({ "type": "tree" }, grammar);

      expect(r.editorBlocks)
        .not.toEqual([]);
      expect(readableConstants(r.editorBlocks[0].visual))
        .toEqual(`<block>node "t1" {<block>prop p1: </block>}</block>`);
      expect(r.editorBlocks[0])
        .toEqual(jasmine.objectContaining({ describedType: { languageName: "g1", typeName: "t1" } }));
    });
  });
});