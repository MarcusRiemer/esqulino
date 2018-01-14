import * as n from './nested-string'

describe('Util: Nested String', () => {

  it('Helper "recursiveJoin": No nesting', () => {
    const r = n.recursiveJoin("a", "x", ["1", "2", "3"]);
    expect(r).toEqual("1a2a3");
  });

  it('Helper "recursiveJoin": First level', () => {
    expect(n.recursiveJoin("a", "x", [["1", "2", "3"]])).toEqual("x1ax2ax3");
    expect(n.recursiveJoin("b", "x", [["1"], "2", ["3"]])).toEqual("x1b2bx3");
    expect(n.recursiveJoin("c", "x", [["1"], ["2"], ["3"]])).toEqual("x1cx2cx3");
  });

  it('Helper "recursiveJoin": Second level', () => {
    expect(n.recursiveJoin("a", "x", [[["1"], "2", "3"]])).toEqual("xx1ax2ax3");
  });

  it('Helper "recursiveJoin": Practical examples', () => {
    expect(n.recursiveJoin("\n", "  ", ["grammar g {", ["node"], "}"])).toEqual("grammar g {\n  node\n}");
    expect(n.recursiveJoin("\n", "  ", ['grammar "g1" {', ['node "n1" {', '}'], ['node "n2" {', '}'], '}'])).toEqual(`grammar "g1" {\n  node "n1" {\n  }\n  node "n2" {\n  }\n}`);
  });
});
