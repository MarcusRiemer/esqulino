import { CodeGenerator } from "../codegenerator";
import { Node, NodeDescription } from "../syntaxtree";

import { NODE_CONVERTER } from "./sql.codegenerator";

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

  return codeGen.emit(ast);
}

describe("Language: SQL (Codegen)", () => {
  it("Constant Number: 1", () => {
    verifyFiles("ast-01-constant-num", emitTree);
  });

  it(`Constant string: 'asdf'`, () => {
    verifyFiles("ast-02-constant-string", emitTree);
  });

  it(`Parameter: :foo`, () => {
    verifyFiles("ast-03-parameter", emitTree);
  });

  it(`Star Operator: *`, () => {
    verifyFiles("ast-04-star-operator", emitTree);
  });

  it(`Binary Expression: 1 + 1`, () => {
    verifyFiles("ast-05-bin-exp-1+1", emitTree);
  });

  it(`Binary Expression: :id = foo.id`, () => {
    verifyFiles("ast-06-bin-exp-param-eq-column", emitTree);
  });

  it(`SELECT component: SELECT *`, () => {
    verifyFiles("ast-07-select-star", emitTree);
  });

  it(`SELECT component: SELECT foo.id`, () => {
    verifyFiles("ast-08-select-column", emitTree);
  });

  it(`SELECT component: SELECT DISTINCT foo.id`, () => {
    verifyFiles("ast-09-select-distinct-column", emitTree);
  });

  it(`SELECT component: SELECT *, foo.id`, () => {
    verifyFiles("ast-10-select-star-column", emitTree);
  });

  it(`Table Introduction: foo`, () => {
    verifyFiles("ast-11-table-foo", emitTree);
  });

  it(`Table Introduction: foo f`, () => {
    verifyFiles("ast-12-table-foo-f", emitTree);
  });

  it(`Cross JOIN: JOIN foo`, () => {
    verifyFiles("ast-13-join-foo", emitTree);
  });

  it(`FROM component: FROM foo`, () => {
    verifyFiles("ast-14-from-foo", emitTree);
  });

  it(`FROM component: FROM foo JOIN bar`, () => {
    verifyFiles("ast-15-from-foo-join-bar", emitTree);
  });

  it(`WHERE additional: AND 1`, () => {
    verifyFiles("ast-16-where-add-and-1", emitTree);
  });

  it(`WHERE additional: OR 1`, () => {
    verifyFiles("ast-17-where-add-or-1", emitTree);
  });

  it(`WHERE component: WHERE 1`, () => {
    verifyFiles("ast-18-where-1", emitTree);
  });

  it(`WHERE component: WHERE 1 AND 1`, () => {
    verifyFiles("ast-19-where-1-and-1", emitTree);
  });

  it(`WHERE component: WHERE 1 AND 1 OR 1`, () => {
    verifyFiles("ast-20-where-1-and-1-or-1", emitTree);
  });

  it(`SELECT query: SELECT foo.id FROM foo`, () => {
    verifyFiles("ast-21-select-foo-id-from-foo", emitTree);
  });

  it(`SELECT query: SELECT foo.id FROM foo GROUP BY foo.id`, () => {
    verifyFiles("ast-22-select-foo-id-from-foo-group-by-foo-id", emitTree);
  });

  it(`WHERE component: no expression`, () => {
    verifyFiles("ast-23-where-no-expr", emitTree);
  });

  it(`SELECT query: SELECT foo.id FROM foo WHERE `, () => {
    verifyFiles("ast-24-query-select-missing-where-expr", emitTree);
  });

  it(`FROM foo INNER JOIN bar ON baz`, () => {
    verifyFiles("ast-25-from-foo-inner-join-bar-on-baz", emitTree);
  });

  it(`FROM foo INNER JOIN bar USING 1`, () => {
    verifyFiles("ast-26-from-foo-inner-join-bar-using-1", emitTree);
  });

  it(`GROUP BY foo.id, bar.baz`, () => {
    verifyFiles("ast-27-group-by-foo-id-bar-baz", emitTree);
  });

  it(`(1)`, () => {
    verifyFiles("ast-28-exp-const-parentheses", emitTree);
  });

  it(`(1 + 1)`, () => {
    verifyFiles("ast-29-exp-bin-op-parentheses", emitTree);
  });

  it(`((1 - 2) + 3)`, () => {
    verifyFiles("ast-30-exp-nested-parentheses", emitTree);
  });

  it(`COUNT()`, () => {
    verifyFiles("ast-31-function-call-count", emitTree);
  });

  it(`COUNT(DISTINCT)`, () => {
    verifyFiles("ast-32-function-call-count-distinct", emitTree);
  });

  it(`COUNT(DISTINCT name)`, () => {
    verifyFiles("ast-33-function-call-count-distinct-name", emitTree);
  });

  it(`COUNT(DISTINCT id, name)`, () => {
    verifyFiles("ast-34-function-call-count-distinct-id-name", emitTree);
  });

  it(`FROM foo, bar`, () => {
    verifyFiles("ast-35-from-foo-bar", emitTree);
  });

  it(`ORDER BY name`, () => {
    verifyFiles("ast-36-order-by-name", emitTree);
  });

  it(`ORDER BY name, age`, () => {
    verifyFiles("ast-37-order-by-name-age", emitTree);
  });

  it(`ORDER BY name DESC`, () => {
    verifyFiles("ast-38-order-by-name-desc", emitTree);
  });

  it(`... AND <hole>`, () => {
    verifyFiles("ast-39-additional-and-hole", emitTree);
  });
});
