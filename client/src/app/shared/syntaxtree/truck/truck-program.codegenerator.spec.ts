import { CodeGenerator } from '../codegenerator'
import { Node, NodeDescription } from '../syntaxtree'

import { PROGRAM_NODE_CONVERTER } from './truck-program.codegenerator'

/**
 * Ensures that the given in and output files do match correctly.
 *
 * This function can not be exported from a different module because the calls
 * to `require` are relative to the file the function is defined in.
 * So for the moment this function is copy and pasted into some spec files :(
 */
export function verifyFiles<T>(fileName: string, transform: (obj: T) => string) {
  const input = require(`./truck-program.spec/${fileName}.json`);
  let expected = require(`raw-loader!./truck-program.spec/${fileName}.txt`) as string;

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
  const codeGen = new CodeGenerator(PROGRAM_NODE_CONVERTER);

  return (codeGen.emit(ast));
}


describe('Language: Trucklino Program (Codegen)', () => {
  it('Procedure Call: goForward', () => {
    verifyFiles("ast-01-procedure-call", emitTree);
  });

  it('Sensor: lightIsRed', () => {
    verifyFiles("ast-02-sensor", emitTree);
  });

  it('Negate Expression: lightIsRed', () => {
    verifyFiles("ast-03-negate-expression", emitTree);
  });

  it('Relational Operator: AND', () => {
    verifyFiles("ast-04-relational-operator-and", emitTree);
  });

  it('Relational Operator: OR', () => {
    verifyFiles("ast-05-relational-operator-or", emitTree);
  });

  it('Boolean Binary Expression: canTurnLeft AND canTurnRight', () => {
    verifyFiles("ast-06-boolean-binary-expression", emitTree);
  });

  it('If: If', () => {
    verifyFiles("ast-07-if", emitTree);
  });

  it('If: If Else', () => {
    verifyFiles("ast-08-if-else", emitTree);
  });

  it('Loop For: Single loop', () => {
    verifyFiles("ast-09-loop-for", emitTree);
  });

  it('Loop For: Double loop', () => {
    verifyFiles("ast-10-loop-for-2", emitTree);
  });

  it('While For: Single loop', () => {
    verifyFiles("ast-11-loop-while", emitTree);
  });

  it('Procedure Call: With one argument', () => {
    verifyFiles("ast-11-procedure-call-w-arg", emitTree);
  });

  it('Procedure Call: With two arguments', () => {
    verifyFiles("ast-12-procedure-call-w-args", emitTree);
  });

  it('Procedure Parameter: FooBar', () => {
    verifyFiles("ast-13-procedure-parameter", emitTree);
  });

  it('Procedure Declaration: FooBar', () => {
    verifyFiles("ast-14-procedure-declaration", emitTree);
  });

  it('Procedure Declaration: FooBar with parameter', () => {
    verifyFiles("ast-15-procedure-declaration-w-param", emitTree);
  });

  it('Procedure Declaration: FooBar with parameters', () => {
    verifyFiles("ast-16-procedure-declaration-w-params", emitTree);
  });

  it('Program: Simple', () => {
    verifyFiles("ast-17-program", emitTree);
  });

  it('Program: Example', () => {
    verifyFiles("ast-18-program-example", emitTree);
  });
});
