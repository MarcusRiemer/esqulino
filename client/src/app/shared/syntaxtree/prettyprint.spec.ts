import * as d from './grammar.description'
import * as p from './prettyprint'
import { QualifiedTypeName } from './syntaxtree.description';

/**
 * Ensures that the given in and output files do match correctly.
 *
 * This function can not be exported from a different module because the calls
 * to `require` are relative to the file the function is defined in.
 * So for the moment this function is copy and pasted into spec files :(
 */
export function verifyFilesTxt<T>(fileName: string, transform: (name: string, obj: T) => string) {
  const input = require(`./spec/${fileName}.json`);
  let expected = require(`raw-loader!./spec/${fileName}.txt`) as string;

  if (expected.endsWith("\n")) {
    expected = expected.substr(0, expected.length - 1);
  }

  expect(transform(fileName, input)).toEqual(expected);
}

/**
 * Ensures that the given in and output files do match correctly.
 *
 * This function can not be exported from a different module because the calls
 * to `require` are relative to the file the function is defined in.
 * So for the moment this function is copy and pasted into spec files :(
 */
export function verifyFilesGraphviz<T>(fileName: string, transform: (obj: T) => string) {
  const input = require(`./spec/${fileName}.json`);
  let expected = require(`raw-loader!./spec/${fileName}.graphviz`) as string;

  if (expected.endsWith("\n")) {
    expected = expected.substr(0, expected.length - 1);
  }

  expect(transform(input)).toEqual(expected);
}

/**
 * Stands for "qualified Typename", saves some verbose repetition
 */
function qt(name: string): QualifiedTypeName {
  return ({ languageName: "spec", typeName: name });
}


describe('Grammar PrettyPrinter', () => {
  it('prop "s1" { string }', () => {
    const r = p.prettyPrintProperty({ type: "property", name: "s1", base: "string" });

    expect(r).toEqual([`prop "s1" { string }`]);
  });

  it('prop? "s2" { string }', () => {
    const r = p.prettyPrintProperty({ type: "property", name: "s2", base: "string", isOptional: true });

    expect(r).toEqual([`prop? "s2" { string }`]);
  });

  it('prop "s3" { string length == 4 }', () => {
    const r = p.prettyPrintProperty({
      name: "s3",
      type: "property",
      base: "string",
      restrictions: [
        {
          type: "length",
          value: 4
        }
      ]
    });

    expect(r).toEqual([`prop "s3" { string length == 4 }`]);
  });

  it('prop "s4" { string { length > 2 length < 4 } }', () => {
    const r = p.prettyPrintProperty({
      name: "s4",
      type: "property",
      base: "string",
      restrictions: [
        {
          type: "minLength",
          value: 2
        },
        {
          type: "maxLength",
          value: 4
        }
      ]
    });

    expect(r).toEqual(
      [
        `prop "s4" {`,
        [
          `string {`,
          [`length > 2`, `length < 4`],
          `}`
        ],
        `}`
      ]);
  });

  it('prop "s5" { string enum }', () => {
    const r = p.prettyPrintProperty({
      name: "s5",
      type: "property",
      base: "string",
      restrictions: [
        {
          type: "enum",
          value: ["a", "b", "c"]
        }
      ]
    });

    expect(r).toEqual([`prop "s5" { string enum "a" "b" "c" }`]);
  });

  it('prop "i1" { integer }', () => {
    const r = p.prettyPrintProperty({
      name: "i1",
      type: "property",
      base: "integer",
    });

    expect(r).toEqual([`prop "i1" { integer }`]);
  });

  it('prop "i2" { integer ≥ 2 }', () => {
    const r = p.prettyPrintProperty({
      name: "i2",
      type: "property",
      base: "integer",
      restrictions: [
        {
          type: "minInclusive",
          value: 2
        }
      ]
    });

    expect(r).toEqual([`prop "i2" { integer ≥ 2 }`]);
  });

  it('prop "i2" { integer ≤ 2 }', () => {
    const r = p.prettyPrintProperty({
      name: "i2",
      type: "property",
      base: "integer",
      restrictions: [
        {
          type: "maxInclusive",
          value: 2
        }
      ]
    });

    expect(r).toEqual([`prop "i2" { integer ≤ 2 }`]);
  });

  it('Type References & Cardinalities', () => {
    const parentType: QualifiedTypeName = { languageName: "spec", typeName: "root" };

    expect(p.prettyPrintTypeReference(parentType, "foo")).toEqual("foo");
    expect(p.prettyPrintTypeReference(parentType, { languageName: "bar", typeName: "foo" })).toEqual("bar.foo");
    expect(p.prettyPrintTypeReference(parentType, { languageName: "spec", typeName: "foo" })).toEqual("foo");
    expect(p.prettyPrintTypeReference(
      parentType,
      {
        nodeType: { languageName: "bar", typeName: "foo" },
        occurs: "1"
      }
    )).toEqual("bar.foo");
    expect(p.prettyPrintTypeReference(
      parentType,
      {
        nodeType: { languageName: "bar", typeName: "foo" },
        occurs: {
          minOccurs: 0,
          maxOccurs: 1,
        }
      }
    )).toEqual("bar.foo?");
    expect(p.prettyPrintTypeReference(
      parentType,
      {
        nodeType: { languageName: "bar", typeName: "foo" },
        occurs: {
          minOccurs: 1,
          maxOccurs: undefined
        }
      }
    )).toEqual("bar.foo+");
    expect(p.prettyPrintTypeReference(
      parentType,
      {
        nodeType: { languageName: "bar", typeName: "foo" },
        occurs: {
          minOccurs: 0,
          maxOccurs: undefined
        }
      }
    )).toEqual("bar.foo*");
    expect(p.prettyPrintTypeReference(
      parentType,
      {
        nodeType: { languageName: "bar", typeName: "foo" },
        occurs: {
          minOccurs: 0,
          maxOccurs: 2,
        }
      }
    )).toEqual("bar.foo{0,2}");
    expect(p.prettyPrintTypeReference(
      parentType,
      {
        nodeType: { languageName: "bar", typeName: "foo" },
        occurs: {
          minOccurs: undefined,
          maxOccurs: 2,
        }
      }
    )).toEqual("bar.foo{,2}");
    expect(p.prettyPrintTypeReference(
      parentType,
      {
        nodeType: { languageName: "bar", typeName: "foo" },
        occurs: {
          minOccurs: 3,
          maxOccurs: undefined
        }
      }
    )).toEqual("bar.foo{3,}");
  });

  it('foo ::= bar baz', () => {
    const r = p.prettyPrintChildGroup(
      { languageName: "spec", typeName: "root" },
      {
        name: "foo",
        nodeTypes: ["bar", "baz"],
        type: "sequence"
      });

    expect(r).toEqual(['children sequence "foo" ::= bar baz']);
  });

  it('foo ::= (a b)+', () => {
    const r = p.prettyPrintChildGroup(
      { languageName: "spec", typeName: "root" },
      {
        name: "foo",
        type: "parentheses",
        group: {
          nodeTypes: ["bar", "baz"],
          type: "sequence"
        },
        cardinality: "+"
      });

    expect(r).toEqual(['children sequence "foo" ::= (bar baz)+']);
  });

  it('foo ::= (a & b)?', () => {
    const r = p.prettyPrintChildGroup(
      { languageName: "spec", typeName: "root" },
      {
        name: "foo",
        type: "parentheses",
        group: {
          nodeTypes: ["bar", "baz"],
          type: "allowed"
        },
        cardinality: "?"
      });

    expect(r).toEqual(['children allowed "foo" ::= (bar & baz)?']);
  });

  it('node "s1" { prop "value" { string } }', () => {
    const r = p.prettyPrintConcreteNodeType(qt("s1"), {
      type: "concrete",
      attributes: [
        {
          name: "value",
          type: "property",
          base: "string"
        }
      ]
    });

    expect(r).toEqual([
      'node "spec"."s1" {', [
        'prop "value" { string }'
      ],
      '}'
    ]);
  });

  it('Grammar g0: empty', () => {
    verifyFilesTxt('g000-empty', p.prettyPrintGrammar);
  });

  it('Grammar g1: empty nodes', () => {
    verifyFilesTxt('g001-empty-nodes', p.prettyPrintGrammar);
  });

  it('Grammar g2: string node', () => {
    verifyFilesTxt('g002-string-node', p.prettyPrintGrammar);
  });

  it('Grammar g3: string node with length = 4', () => {
    verifyFilesTxt('g003-string-node-length', p.prettyPrintGrammar);
  });

  it('Grammar g4: string node with minimum and maximum length', () => {
    verifyFilesTxt('g004-string-node-length-min-max', p.prettyPrintGrammar);
  });

  it('Grammar g5: single node that is its own child', () => {
    verifyFilesTxt('g005-node-child-self', p.prettyPrintGrammar);
  });

  it('Grammar g6: single node that is optionally its own child', () => {
    verifyFilesTxt('g006-node-child-self-optional', p.prettyPrintGrammar);
  });

  it('Grammar g7: mixed cardinality for allowed children', () => {
    verifyFilesTxt('g007-node-child-allowed-mix', p.prettyPrintGrammar);
  });

  it('Grammar g8: choice between two sequences', () => {
    verifyFilesTxt('g008-node-child-choice-sequence', p.prettyPrintGrammar);
  });

  it('Grammar g9: single terminal node', () => {
    verifyFilesTxt('g009-terminal-only', p.prettyPrintGrammar);
  });

  it('Grammar g10: terminal first and last', () => {
    verifyFilesTxt('g010-terminal-first-last', p.prettyPrintGrammar);
  });

  it('Grammar g11: one of for root', () => {
    verifyFilesTxt('g011-one-of-root', p.prettyPrintGrammar);
  });

  it('Grammar g12: sequence separator', () => {
    verifyFilesTxt('g012-sequence-separator', p.prettyPrintGrammar);
  });

  it('Grammar g13: foreign reference', () => {
    verifyFilesTxt('g013-foreign-reference', p.prettyPrintGrammar);
  });

  it('Grammar g14: RegEx Language', () => {
    verifyFilesTxt('g014-regex-language', p.prettyPrintGrammar);
  });
});

const printWrapper = (_: string, obj: any) => p.prettyPrintSyntaxTree(obj);

describe('SyntaxTree PrettyPrinter', () => {
  it('Tree t0: Empty root', () => {
    verifyFilesTxt('t000-empty-root', printWrapper);
    verifyFilesGraphviz('t000-empty-root', p.graphvizSyntaxTree);
  });

  it('Tree t1: Root with single prop', () => {
    verifyFilesTxt('t001-root-single-prop', printWrapper);
    verifyFilesGraphviz('t001-root-single-prop', p.graphvizSyntaxTree);
  });

  it('Tree t2: Root with single child', () => {
    verifyFilesTxt('t002-root-single-child', printWrapper);
    verifyFilesGraphviz('t002-root-single-child', p.graphvizSyntaxTree);
  });

  it('Tree t3: Root with two childgroups', () => {
    verifyFilesTxt('t003-root-two-childgroups', printWrapper);
    verifyFilesGraphviz('t003-root-two-childgroups', p.graphvizSyntaxTree);
  });

  it('Tree t4: Root with three children', () => {
    verifyFilesTxt('t004-root-three-children', printWrapper);
    verifyFilesGraphviz('t004-root-three-children', p.graphvizSyntaxTree);
  });

  it('Tree t5: Root with three complex children', () => {
    verifyFilesTxt('t005-root-complex-children', printWrapper);
    verifyFilesGraphviz('t005-root-complex-children', p.graphvizSyntaxTree);
  });

  it('Tree t6: Manual example (if)', () => {
    verifyFilesTxt('t006-manual-if-example', printWrapper);
    verifyFilesGraphviz('t006-manual-if-example', p.graphvizSyntaxTree);
  });
});
