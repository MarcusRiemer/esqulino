import * as n from "./nested-string";

describe("Util: Nested String", () => {
  it("Undefined", () => {
    expect(n.recursiveJoin("s", "i", undefined)).toEqual("");
    expect(n.recursiveJoin("s", "i", [undefined, "a"])).toEqual("a");
    expect(n.recursiveJoin("s", "i", ["a", undefined])).toEqual("a");
  });

  it("No nesting", () => {
    const r = n.recursiveJoin("a", "x", ["1", "2", "3"]);
    expect(r).toEqual("1a2a3");
  });

  it("First level", () => {
    expect(n.recursiveJoin("a", "x", [["1", "2", "3"]])).toEqual("x1ax2ax3");
    expect(n.recursiveJoin("b", "x", [["1"], "2", ["3"]])).toEqual("x1b2bx3");
    expect(n.recursiveJoin("c", "x", [["1"], ["2"], ["3"]])).toEqual(
      "x1cx2cx3"
    );
  });

  it("Second level", () => {
    expect(n.recursiveJoin("a", "x", [[["1"], "2", "3"]])).toEqual("xx1ax2ax3");
  });

  it("Practical examples", () => {
    expect(n.recursiveJoin("\n", "  ", ["grammar g {", ["node"], "}"])).toEqual(
      "grammar g {\n  node\n}"
    );
    expect(
      n.recursiveJoin("\n", "  ", [
        'grammar "g1" {',
        ['node "n1" {', "}"],
        ['node "n2" {', "}"],
        "}",
      ])
    ).toEqual(`grammar "g1" {\n  node "n1" {\n  }\n  node "n2" {\n  }\n}`);
  });
});
