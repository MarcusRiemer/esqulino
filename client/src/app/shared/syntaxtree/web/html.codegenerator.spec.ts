import { CodeGenerator } from '../codegenerator'
import { NodeDescription, Tree } from '../syntaxtree'

import { HTML_CONVERTER } from './html.codegenerator'

/**
 * Ensures that the given in and output files do match correctly.
 *
 * This function can not be exported from a different module because the calls
 * to `require` are relative to the file the function is defined in.
 * So for the moment this function is copy and pasted into some spec files :(
 */
export function verifyFiles<T>(fileName: string, transform: (obj: T) => string) {
  const input = require(`./html.spec/${fileName}.json`);
  let expected = require(`raw-loader!./html.spec/${fileName}.txt`) as string;

  if (expected.endsWith("\n")) {
    expected = expected.substr(0, expected.length - 1);
  }

  expect(transform(input)).toEqual(expected);
}

/**
 * Calculates the string representation of the given AST
 */
function emitTree(astDesc: NodeDescription) {
  const ast = new Tree(astDesc).rootNode;
  const codeGen = new CodeGenerator(HTML_CONVERTER);

  return (codeGen.emit(ast));
}

describe('Language: Web (HTML Codegen)', () => {
  it('001: Empty document', () => {
    verifyFiles("ast-01-empty-document", emitTree);
  });
});