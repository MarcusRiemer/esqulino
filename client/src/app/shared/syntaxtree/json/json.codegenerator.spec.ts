import { CodeGenerator } from '../codegenerator'
import { Node, NodeDescription } from '../syntaxtree'

import { NODE_CONVERTER } from './json.codegenerator'

/**
 * Ensures that the given in and output files do match correctly.
 *
 * This function can not be exported from a different module because the calls
 * to `require` are relative to the file the function is defined in.
 * So for the moment this function is copy and pasted into some spec files :(
 */
export function verifyFiles<T>(fileName: string, transform: (obj: T) => string) {
  const input = require(`./spec/${fileName}.json`);
  let expected = require(`raw-loader!./spec/${fileName}.txt`).default as string;

  if (expected.endsWith("\n")) {
    expected = expected.substr(0, expected.length - 1);
  }

  expect(transform(input)).toEqual(expected);
}

/**
 * Calculates the string representation of the given AST
 */
function emitTree(astDesc: NodeDescription) {
  const ast = new Node(astDesc, undefined);
  const codeGen = new CodeGenerator(NODE_CONVERTER);

  return (codeGen.emit(ast));
}

describe('Language: JSON (Codegen)', () => {
  it('01: null', () => {
    verifyFiles("01-null", emitTree);
  });

  it('02: "string"', () => {
    verifyFiles("02-string", emitTree);
  });

  it('03: 123', () => {
    verifyFiles("03-number", emitTree);
  });

  it('04: true', () => {
    verifyFiles("04-boolean", emitTree);
  });

  it('05: []', () => {
    verifyFiles("05-array-empty", emitTree);
  });

  it('06: [null]', () => {
    verifyFiles("06-array-null", emitTree);
  });

  it('07: [null,"string"]', () => {
    verifyFiles("07-array-null-string", emitTree);
  });

  it('08: {}', () => {
    verifyFiles("08-object-empty", emitTree);
  });

  it('09: { "key": null}', () => {
    verifyFiles("09-object-string-null", emitTree);
  });

  it('10: { "123": 123 }', () => {
    verifyFiles("10-object-string-number", emitTree);
  });

  it('11: { "123": 123, "124": 124 }', () => {
    verifyFiles("11-object-multiple", emitTree);
  });

  it('12: { "key": { "key": null } }', () => {
    verifyFiles("12-object-nested-object", emitTree);
  });

  it('13: [{}]', () => {
    verifyFiles("13-array-empty-object", emitTree);
  });
});
