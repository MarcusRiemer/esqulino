import * as d from './grammar.description'
import * as p from './prettyprint'

/**
 * Ensures that the given in and output files do match correctly.
 *
 * This function can not be exported from a different module because the calls
 * to `require` are relative to the file the function is defined in.
 * So for the moment this function is copy and pasted into spec files :(
 */
export function verifyFilesTxt<T>(fileName: string, transform: (obj: T) => string) {
  const input = require(`./spec/${fileName}.json`);
  let expected = require(`raw-loader!./spec/${fileName}.txt`) as string;

  if (expected.endsWith("\n")) {
    expected = expected.substr(0, expected.length - 1);
  }

  expect(transform(input)).toEqual(expected);
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


describe('Grammar PrettyPrinter', () => {
  it('prop "s1" { string }', () => {
    const r = p.prettyPrintProperty({ type: "property", name: "s1", base: "string" });

    expect(r).toEqual([`prop "s1" { string }`]);
  });

  it('prop? "s2" { string }', () => {
    const r = p.prettyPrintProperty({ type: "property", name: "s2", base: "string", isOptional: true });

    expect(r).toEqual([`prop? "s2" { string }`]);
  });

  it('prop "s3" { string { length=4 } }', () => {
    const r = p.prettyPrintProperty({
      name: "s3",
      base: "string",
      restrictions: [
        {
          type: "length",
          value: 4
        }
      ]
    } as d.NodePropertyStringDescription);

    expect(r).toEqual([`prop "s3" { string { length 4 } }`]);
  });

  it('prop "s4" { string { minLength 2 maxLength 4 } }', () => {
    const r = p.prettyPrintProperty({
      name: "s4",
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
    } as d.NodePropertyStringDescription);

    expect(r).toEqual(
      [
        `prop "s4" {`,
        [
          `string {`,
          [`minLength 2`, `maxLength 4`],
          `}`
        ],
        `}`
      ]);
  });

  it('prop "i1" { integer }', () => {
    const r = p.prettyPrintProperty({
      name: "i1",
      base: "integer",
    } as d.NodePropertyIntegerDescription);

    expect(r).toEqual([`prop "i1" { integer }`]);
  });

  it('Type References & Cardinalities', () => {
    expect(p.prettyPrintTypeReference("foo")).toEqual("foo");
    expect(p.prettyPrintTypeReference({ languageName: "bar", typeName: "foo" })).toEqual("bar.foo");
    expect(p.prettyPrintTypeReference({
      nodeType: { languageName: "bar", typeName: "foo" },
      occurs: {
        minOccurs: 0,
        maxOccurs: 1,
      }
    })).toEqual("bar.foo?");
    expect(p.prettyPrintTypeReference({
      nodeType: { languageName: "bar", typeName: "foo" },
      occurs: {
        minOccurs: 1,
        maxOccurs: undefined
      }
    })).toEqual("bar.foo+");
    expect(p.prettyPrintTypeReference({
      nodeType: { languageName: "bar", typeName: "foo" },
      occurs: {
        minOccurs: 0,
        maxOccurs: undefined
      }
    })).toEqual("bar.foo*");
    expect(p.prettyPrintTypeReference({
      nodeType: { languageName: "bar", typeName: "foo" },
      occurs: {
        minOccurs: 0,
        maxOccurs: 2,
      }
    })).toEqual("bar.foo{0,2}");
    expect(p.prettyPrintTypeReference({
      nodeType: { languageName: "bar", typeName: "foo" },
      occurs: {
        minOccurs: undefined,
        maxOccurs: 2,
      }
    })).toEqual("bar.foo{,2}");
    expect(p.prettyPrintTypeReference({
      nodeType: { languageName: "bar", typeName: "foo" },
      occurs: {
        minOccurs: 3,
        maxOccurs: undefined
      }
    })).toEqual("bar.foo{3,}");
  });

  it('foo ::= bar baz', () => {
    const r = p.prettyPrintChildGroup({
      name: "foo",
      nodeTypes: ["bar", "baz"],
      type: "sequence"
    });

    expect(r).toEqual(['children "foo" ::= bar baz']);
  });

  it('node "s1" { prop "value" { string } }', () => {
    debugger;
    const r = p.prettyPrintConcreteNodeType("s1", {
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
      'node "s1" {', [
        'prop "value" { string }'
      ],
      '}'
    ]);
  });

  it('Grammar g0: empty', () => {
    verifyFilesTxt('g0-empty', p.prettyPrintGrammar);
  });

  it('Grammar g1: empty nodes', () => {
    verifyFilesTxt('g1-empty-nodes', p.prettyPrintGrammar);
  });

  it('Grammar g2: string node', () => {
    verifyFilesTxt('g2-string-node', p.prettyPrintGrammar);
  });

  it('Grammar g3: string node with length = 4', () => {
    verifyFilesTxt('g3-string-node-length', p.prettyPrintGrammar);
  });

  it('Grammar g4: string node with minimum and maximum length', () => {
    verifyFilesTxt('g4-string-node-length-min-max', p.prettyPrintGrammar);
  });

  it('Grammar g5: single node that is its own child', () => {
    verifyFilesTxt('g5-node-child-self', p.prettyPrintGrammar);
  });

  it('Grammar g6: single node that is optionally its own child', () => {
    verifyFilesTxt('g6-node-child-self-optional', p.prettyPrintGrammar);
  });

  it('Grammar g7: mixed cardinality for allowed children', () => {
    verifyFilesTxt('g7-node-child-allowed-mix', p.prettyPrintGrammar);
  });

  it('Grammar g8: choice between two sequences', () => {
    verifyFilesTxt('g8-node-child-choice-sequence', p.prettyPrintGrammar);
  });
});

describe('SyntaxTree PrettyPrinter', () => {
  it('Tree t0: Empty root', () => {
    verifyFilesTxt('t0-empty-root', p.prettyPrintSyntaxTree);
    verifyFilesGraphviz('t0-empty-root', p.graphvizSyntaxTree);
  });

  it('Tree t1: Root with single prop', () => {
    verifyFilesTxt('t1-root-single-prop', p.prettyPrintSyntaxTree);
    verifyFilesGraphviz('t1-root-single-prop', p.graphvizSyntaxTree);
  });

  it('Tree t2: Root with single child', () => {
    verifyFilesTxt('t2-root-single-child', p.prettyPrintSyntaxTree);
    verifyFilesGraphviz('t2-root-single-child', p.graphvizSyntaxTree);
  });

  it('Tree t3: Root with two childgroups', () => {
    verifyFilesTxt('t3-root-two-childgroups', p.prettyPrintSyntaxTree);
    verifyFilesGraphviz('t3-root-two-childgroups', p.graphvizSyntaxTree);
  });

  it('Tree t4: Root with three children', () => {
    verifyFilesTxt('t4-root-three-children', p.prettyPrintSyntaxTree);
    verifyFilesGraphviz('t4-root-three-children', p.graphvizSyntaxTree);
  });

  it('Tree t5: Root with three complex children', () => {
    verifyFilesTxt('t5-root-complex-children', p.prettyPrintSyntaxTree);
    verifyFilesGraphviz('t5-root-complex-children', p.graphvizSyntaxTree);
  });

  it('Tree t6: Manual example (if)', () => {
    verifyFilesTxt('t6-manual-if-example', p.prettyPrintSyntaxTree);
    verifyFilesGraphviz('t6-manual-if-example', p.graphvizSyntaxTree);
  });
});
