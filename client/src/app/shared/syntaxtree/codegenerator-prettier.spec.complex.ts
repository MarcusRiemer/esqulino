import { SyntaxTree } from "./syntaxtree";
import { allVisualisableTypes } from "./grammar-type-util";
import { prettierCodeGeneratorFromGrammar } from "./codegenerator-prettier";

/**
 * Ensures that the given in and output files do match correctly.
 *
 * This function can not be exported from a different module because the calls
 * to `require` are relative to the file the function is defined in.
 * So for the moment this function is copy and pasted into spec files :(
 */
export function verifyFiles(grammarName: string, astName: string) {
  it(`${grammarName}-${astName}`, () => {
    const grammar = require(`./spec/${grammarName}.json`);
    const ast = require(`./spec/${grammarName}-${astName}.json`);
    let expected = require(`raw-loader!./spec/${grammarName}-${astName}.txt`)
      .default as string;

    if (expected.endsWith("\n")) {
      expected = expected.substr(0, expected.length - 1);
    }

    const types = allVisualisableTypes(grammar);

    const res = prettierCodeGeneratorFromGrammar(
      types,
      new SyntaxTree(ast).rootNode
    );
    expect(res).toEqual(expected);
  });
}

describe(`Automatic code generation with complex files`, () => {
  describe(`Visualized XML`, () => {
    verifyFiles("xmlvis", "001-node-attrib");
    verifyFiles("xmlvis", "002-node-single-child");
  });

  describe(`JavaScript`, () => {
    verifyFiles("js", "001-const-for");
  });
});
