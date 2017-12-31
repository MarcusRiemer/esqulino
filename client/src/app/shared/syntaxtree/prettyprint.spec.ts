import * as d from './validator.description'
import * as p from './prettyprint'

/**
 * Ensures that the given in and output files do match correctly.
 */
function verifyFiles(fileName: string) {
  const input = require(`json-loader!./spec/${fileName}.json`);
  let expected = require(`raw-loader!./spec/${fileName}.txt`) as string;

  if (expected.endsWith("\n")) {
    expected = expected.substr(0, expected.length - 1);
  }

  expect(p.prettyPrintGrammar(input)).toEqual(expected);
}

describe('Grammar PrettyPrinter', () => {
  it('Helper "recursiveJoin": No nesting', () => {
    const r = p.recursiveJoin("a", "x", ["1", "2", "3"]);
    expect(r).toEqual("1a2a3");
  });

  it('Helper "recursiveJoin": First level', () => {
    expect(p.recursiveJoin("a", "x", [["1", "2", "3"]])).toEqual("x1ax2ax3");
    expect(p.recursiveJoin("b", "x", [["1"], "2", ["3"]])).toEqual("x1b2bx3");
    expect(p.recursiveJoin("c", "x", [["1"], ["2"], ["3"]])).toEqual("x1cx2cx3");
  });

  it('Helper "recursiveJoin": Second level', () => {
    expect(p.recursiveJoin("a", "x", [[["1"], "2", "3"]])).toEqual("xx1ax2ax3");
  });

  it('Helper "recursiveJoin": Practical examples', () => {
    expect(p.recursiveJoin("\n", "  ", ["grammar g {", ["node"], "}"])).toEqual("grammar g {\n  node\n}");
    expect(p.recursiveJoin("\n", "  ", ['grammar "g1" {', ['node "n1" {', '}'], ['node "n2" {', '}'], '}'])).toEqual(`grammar "g1" {\n  node "n1" {\n  }\n  node "n2" {\n  }\n}`);
  });

  it('prop "s1" { string }', () => {
    const r = p.prettyPrintProperty("s1", { base: "string" });

    expect(r).toEqual([`prop "s1" { string }`]);
  });

  it('prop? "s2" { string }', () => {
    const r = p.prettyPrintProperty("s1", { base: "string", isOptional: true });

    expect(r).toEqual([`prop? "s1" { string }`]);
  });

  it('prop "s3" { string { length=4 } }', () => {
    const r = p.prettyPrintProperty("s3", {
      base: "string",
      restrictions: [
        {
          type: "length",
          value: 4
        }
      ]
    } as d.NodePropertyStringDescription);

    expect(r).toEqual([`prop "s3" { string { length=4 } }`]);
  });

  it('prop "s4" { string { minLength=2 maxLength=4 } }', () => {
    const r = p.prettyPrintProperty("s4", {
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
          [`minLength=2`, `maxLength=4`],
          `}`
        ],
        `}`
      ]);
  });

  it('prop "i1" { integer }', () => {
    const r = p.prettyPrintProperty("i1", {
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
    const r = p.prettyPrintChildGroup('foo', {
      nodeTypes: ["bar", "baz"],
      type: "sequence"
    });

    expect(r).toEqual('children "foo" ::= bar baz');
  });

  it('Empty Grammar', () => {
    verifyFiles('g0-empty');
  });

  it('Grammar with empty nodes', () => {
    verifyFiles('g1-empty-nodes');
  });

  it('Grammar g2: string node', () => {
    verifyFiles('g2-string-node');
  });

  it('Grammar g3: string node with length = 4', () => {
    verifyFiles('g3-string-node-length');
  });

  it('Grammar g4: string node with minimum and maximum length', () => {
    verifyFiles('g4-string-node-length-min-max');
  });

  it('Grammar g5: single node that is its own child', () => {
    verifyFiles('g5-node-child-self');
  });

  it('Grammar g6: single node that is optionally its own child', () => {
    verifyFiles('g6-node-child-self-optional');
  });

  it('Grammar g7: mixed cardinality for allowed children', () => {
    verifyFiles('g7-node-child-allowed-mix');
  });

  it('Grammar g8: choice between two sequences', () => {
    verifyFiles('g8-node-child-choice-sequence');
  });
});
