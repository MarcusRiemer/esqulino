import { CodeGenerator } from "../codegenerator";
import { NodeDescription, Tree } from "../syntaxtree";

import { NODE_CONVERTER } from "./regex.codegenerator";

/**
 * Ensures that the given in and output files do match correctly.
 *
 * This function can not be exported from a different module because the calls
 * to `require` are relative to the file the function is defined in.
 * So for the moment this function is copy and pasted into some spec files :(
 */
export function verifyFiles<T>(
  fileName: string,
  transform: (obj: T) => string
) {
  const input = require(`./regex.spec/${fileName}.json`);
  let expected = require(`raw-loader!./regex.spec/${fileName}.txt`)
    .default as string;

  if (expected.endsWith("\n")) {
    expected = expected.substr(0, expected.length - 1);
  }

  expect(transform(input)).toEqual(expected);
}

/**
 * Calculates the string representation of the given AST
 */
function emitTree(astDesc: NodeDescription, emitProgressCallback = false) {
  const ast = new Tree(astDesc).rootNode;
  const codeGen = new CodeGenerator(NODE_CONVERTER, []);

  return codeGen.emit(ast);
}

/**
 * Calculates the string representation of the given AST
 * with generated callbacks
 */
function emitTreeWithProgressCallbacks(astDesc: NodeDescription) {
  return emitTree(astDesc, true);
}

describe("Language: RegEx Program (Codegen)", () => {
  it("01: a", () => {
    verifyFiles("ast-01-a", emitTree);
  });

  it("02: a|b", () => {
    verifyFiles("ast-02-aORb", emitTree);
  });

  it("03: d", () => {
    verifyFiles("ast-03-digitClass", emitTree);
  });

  it("04: a+", () => {
    verifyFiles("ast-04-a+", emitTree);
  });

  it("05: telephoneRegex", () => {
    verifyFiles("ast-05-telephoneRegex", emitTree);
  });

  it("06: ^abc$", () => {
    verifyFiles("ast-06-startAndEndOfLine", emitTree);
  });

  it("07: a{1}b{1, }c{1, 2}", () => {
    verifyFiles("ast-07-quantifierRanges", emitTree);
  });

  it("08: a(a|b)b", () => {
    verifyFiles("ast-08-groupedAlternative", emitTree);
  });

  it("09: [^a]", () => {
    verifyFiles("ast-09-characterRangeNegatedChar", emitTree);
  });

  it("10: [%^\\d]", () => {
    verifyFiles(
      "ast-10-characterRangeSymbolAndNegatedCharacterClass",
      emitTree
    );
  });

  it("11: anyCharacter", () => {
    verifyFiles("ast-11-anyCharacter", emitTree);
  });

  it("12: email regex", () => {
    verifyFiles("ast-12-emailRegex", emitTree);
  });
});
