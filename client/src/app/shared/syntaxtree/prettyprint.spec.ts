import * as d from './validator.description'
import * as p from './prettyprint'

describe('Grammar PrettyPrinter', () => {
  it('Helper "recursiveJoin": No nesting', () => {
    const r = p.recursiveJoin("a", ["1", "2", "3"]);
    expect(r).toEqual("1a2a3");
  });

  it('Helper "recursiveJoin": First level', () => {
    expect(p.recursiveJoin("a", [["1", "2", "3"]])).toEqual("  1a  2a  3");
    expect(p.recursiveJoin("b", [["1"], "2", ["3"]])).toEqual("  1b2b  3");
    expect(p.recursiveJoin("c", [["1"], ["2"], ["3"]])).toEqual("  1c  2c  3");
  });

  it('Helper "recursiveJoin": Second level', () => {
    expect(p.recursiveJoin("a", [[["1"], "2", "3"]])).toEqual("    1a  2a  3");
  });

  it('Helper "recursiveJoin": Practical examples', () => {
    expect(p.recursiveJoin("\n", ["grammar g {", ["node"], "}"])).toEqual("grammar g {\n  node\n}");
  });

  it('Empty Grammar', () => {
    const r = p.prettyPrintGrammar({
      languageName: "addressBook",
      root: "addressBook",
      types: {}
    });
    expect(r).toEqual(`grammar "addressBook" {\n}`);
  });

  it('Grammar with empty nodes', () => {
    const r = p.prettyPrintGrammar({
      languageName: "addressBook",
      root: "addressBook",
      types: {
        "addressBook": {

        },
        "card": {

        }
      }
    });
    expect(r).toEqual(`grammar "addressBook" {\n    node "addressBook" {\n    }\n    node "card" {\n    }\n}`);
  });

  it('prop "s1" { string }', () => {
    const r = p.prettyPrintProperty("s1", { base: "string" });

    expect(r.join(' ')).toEqual(`prop "s1" { string }`);
  });

  it('prop "s2" { string { length=4 } }', () => {
    const r = p.prettyPrintProperty("s2", {
      base: "string",
      restrictions: [
        {
          type: "length",
          value: 4
        }
      ]
    } as d.NodePropertyStringDescription);

    expect(r.join(' ')).toEqual(`prop "s2" { string { length=4 } }`);
  });

  it('prop "i1" { integer }', () => {
    const r = p.prettyPrintProperty("i1", {
      base: "integer",
    } as d.NodePropertyIntegerDescription);

    expect(r.join(' ')).toEqual(`prop "i1" { integer }`);
  });
});
