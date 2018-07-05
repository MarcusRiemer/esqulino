import { GrammarDescription } from '../syntaxtree/grammar.description'

import { BlockLanguageGeneratorDescription } from './generator.description'
import { convert } from './generator'

describe("BlockLanguage Generator", () => {
  it("Almost empty grammar with almost no generation instructions", () => {
    const grammar: GrammarDescription = {
      id: "008f7fc3-f9a9-4ba3-932d-e7563ef7b31a",
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
      editorComponents: [],
      targetName: "b1",
      targetProgrammingLanguage: "sql",
    };

    const r = convert(generator, grammar);

    expect(r.name).toEqual(generator.targetName);
    expect(r.editorBlocks.length).toEqual(1);
  });

  it("No blocks for 'oneOf'-types", () => {
    const grammar: GrammarDescription = {
      id: "008f7fc3-f9a9-4ba3-932d-e7563ef7b31a",
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
      editorComponents: [],
      targetName: "b1",
      targetProgrammingLanguage: "sql",
    };

    const r = convert(generator, grammar);

    expect(r.name).toEqual(generator.targetName);
    expect(r.editorBlocks.length).toEqual(2);
  });
});
