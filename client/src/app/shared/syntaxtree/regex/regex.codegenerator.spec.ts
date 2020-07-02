import { CodeGenerator } from '../codegenerator'
import { NodeDescription, Tree } from '../syntaxtree'

import { NODE_CONVERTER } from './regex.codegenerator'

/**
 * Ensures that the given in and output files do match correctly.
 *
 * This function can not be exported from a different module because the calls
 * to `require` are relative to the file the function is defined in.
 * So for the moment this function is copy and pasted into some spec files :(
 */
export function verifyFiles<T>(fileName: string, transform: (obj: T) => string) {
  const input = require(`./regex.spec/${fileName}.json`);
  let expected = require(`raw-loader!./regex.spec/${fileName}.txt`).default as string;

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

  return (codeGen.emit(ast));
}

/**
 * Calculates the string representation of the given AST
 * with generated callbacks
 */
function emitTreeWithProgressCallbacks(astDesc: NodeDescription) {
  return emitTree(astDesc, true);
}


describe('Language: RegEx Program (Codegen)', () => {
  it('constant', () => {
    verifyFiles("ast-01-constant", emitTree);
  });


});
