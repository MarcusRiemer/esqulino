import { CodeGenerator } from "../codegenerator";
import { SyntaxNode, NodeDescription, SyntaxTree } from "../syntaxtree";
import { Validator } from "../validator";
import { printableError } from "../validation-result";

import { GRAMMAR_DESCRIPTION } from "./css.grammar";
import { NODE_CONVERTER } from "./css.codegenerator";

/**
 * Ensures that the given in and output files do match correctly.
 *
 * This function can not be exported from a different module because the calls
 * to `require` are relative to the file the function is defined in.
 * So for the moment this function is copy and pasted into some spec files :(
 */
function verifyEmitted<T>(fileName: string, transform: (obj: T) => string) {
  const input = require(`./spec/${fileName}.json`);
  let expected = require(`raw-loader!./spec/${fileName}.txt`).default as string;

  if (expected.endsWith("\n")) {
    expected = expected.substr(0, expected.length - 1);
  }

  expect(transform(input)).toEqual(expected);
}

function emitTree(astDesc: NodeDescription) {
  const ast = new SyntaxNode(astDesc, undefined);
  const codeGen = new CodeGenerator(NODE_CONVERTER);

  return codeGen.emit(ast);
}

function validate(fileName: string, isValid: boolean) {
  const astDesc = require(`./spec/${fileName}.json`);
  const ast = new SyntaxTree(astDesc);

  const validator = new Validator([GRAMMAR_DESCRIPTION]);
  const result = validator.validateFromRoot(ast);

  expect(result.errors.map((e) => printableError(e))).toEqual(
    [],
    `${fileName} should be ${isValid ? "valid" : "invalid"}`
  );

  return result;
}

/**
 *
 */
function runTestcase(fileName: string) {
  it(fileName, () => {
    validate(fileName, true);
    verifyEmitted(fileName, emitTree);
  });
}

describe("Language: CSS", () => {
  runTestcase("ast-01-empty");
  runTestcase("ast-02-universal-empty");
  runTestcase("ast-03-universal-single-declaration");
  runTestcase("ast-04-type-dual-declaration");
  runTestcase("ast-05-id");
  runTestcase("ast-06-class");
});
