import * as d from './validator.description'
import * as p from './prettyprint'

/**
 * Ensures that the given in and output files do match correctly.
 *
 * This function can not be exported from a different module because the calls
 * to `require` are relative to the file the function is defined in.
 * So for the moment this function is copy and pasted into spec files :(
 */
export function verifyFiles<T>(fileName: string, expExt: string, transform: (obj: T) => string) {
  const input = require(`json-loader!./spec/${fileName}.json`);
  let expected = require(`raw-loader!./spec/${fileName}.${expExt}`) as string;

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
    verifyFiles('g0-empty', 'txt', p.prettyPrintGrammar);
  });

  it('Grammar g1: empty nodes', () => {
    verifyFiles('g1-empty-nodes', 'txt', p.prettyPrintGrammar);
  });

  it('Grammar g2: string node', () => {
    verifyFiles('g2-string-node', 'txt', p.prettyPrintGrammar);
  });

  it('Grammar g3: string node with length = 4', () => {
    verifyFiles('g3-string-node-length', 'txt', p.prettyPrintGrammar);
  });

  it('Grammar g4: string node with minimum and maximum length', () => {
    verifyFiles('g4-string-node-length-min-max', 'txt', p.prettyPrintGrammar);
  });

  it('Grammar g5: single node that is its own child', () => {
    verifyFiles('g5-node-child-self', 'txt', p.prettyPrintGrammar);
  });

  it('Grammar g6: single node that is optionally its own child', () => {
    verifyFiles('g6-node-child-self-optional', 'txt', p.prettyPrintGrammar);
  });

  it('Grammar g7: mixed cardinality for allowed children', () => {
    verifyFiles('g7-node-child-allowed-mix', 'txt', p.prettyPrintGrammar);
  });

  it('Grammar g8: choice between two sequences', () => {
    verifyFiles('g8-node-child-choice-sequence', 'txt', p.prettyPrintGrammar);
  });
});

describe('SyntaxTree PrettyPrinter', () => {
  it('Tree t0: Empty root', () => {
    verifyFiles('t0-empty-root', 'txt', p.prettyPrintSyntaxTree);
    verifyFiles('t0-empty-root', 'graphviz', p.graphvizSyntaxTree);
  });

  it('Tree t1: Root with single prop', () => {
    verifyFiles('t1-root-single-prop', 'txt', p.prettyPrintSyntaxTree);
    verifyFiles('t1-root-single-prop', 'graphviz', p.graphvizSyntaxTree);
  });

  it('Tree t2: Root with single child', () => {
    verifyFiles('t2-root-single-child', 'txt', p.prettyPrintSyntaxTree);
    verifyFiles('t2-root-single-child', 'graphviz', p.graphvizSyntaxTree);
  });

  it('Tree t3: Root with two childgroups', () => {
    verifyFiles('t3-root-two-childgroups', 'txt', p.prettyPrintSyntaxTree);
    verifyFiles('t3-root-two-childgroups', 'graphviz', p.graphvizSyntaxTree);
  });

  it('Tree t4: Root with three children', () => {
    verifyFiles('t4-root-three-children', 'txt', p.prettyPrintSyntaxTree);
    verifyFiles('t4-root-three-children', 'graphviz', p.graphvizSyntaxTree);
  });

  it('Tree t5: Root with three complex children', () => {
    verifyFiles('t5-root-complex-children', 'txt', p.prettyPrintSyntaxTree);
    verifyFiles('t5-root-complex-children', 'graphviz', p.graphvizSyntaxTree);
  });

  it('Tree t6: Manual example (if)', () => {
    verifyFiles('t6-manual-if-example', 'txt', p.prettyPrintSyntaxTree);
    verifyFiles('t6-manual-if-example', 'graphviz', p.graphvizSyntaxTree);
  });
});
