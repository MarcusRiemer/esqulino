import { Tree, NodeDescription, NodeLocation } from "../syntaxtree";
import { tailorBlockDescription } from "./sidebar-blocks";
import { NodeTailoredDescription } from "./block.description";

describe(`tailorBlockDescription()`, () => {
  it(`Doesn't change an empty node`, () => {
    const t = new Tree({ language: "spec", name: "root" });
    const n: NodeDescription = {
      language: "spec",
      name: "used",
    };

    expect(tailorBlockDescription(t, n)).toEqual(n);
  });

  it(`Doesn't change a node with no tailored properties`, () => {
    const t = new Tree({ language: "spec", name: "root" });
    const n: NodeDescription = {
      language: "spec",
      name: "used",
      properties: {
        a: "a",
      },
    };

    expect(tailorBlockDescription(t, n)).toEqual(n);
  });

  const tRootWitha1 = new Tree({
    language: "spec",
    name: "root",
    properties: {
      a: "1",
    },
  });

  it(`Resolves property "a" from root`, () => {
    const n: NodeTailoredDescription = {
      language: "spec",
      name: "used",
      properties: {
        a: {
          type: "nodeDerivedProperty",
          loc: [],
          propName: "a",
        },
      },
    };

    const r = Object.assign({}, n, {
      properties: { a: "1" },
    }) as NodeDescription;
    expect(tailorBlockDescription(tRootWitha1, n)).toEqual(r);
  });

  it(`Resolves property "a" with falsy value from root`, () => {
    const t = new Tree({
      language: "spec",
      name: "root",
      properties: {
        a: "",
      },
    });
    const n: NodeTailoredDescription = {
      language: "spec",
      name: "used",
      properties: {
        a: {
          type: "nodeDerivedProperty",
          loc: [],
          propName: "a",
        },
      },
    };

    const r = Object.assign({}, n, {
      properties: { a: "" },
    }) as NodeDescription;
    expect(tailorBlockDescription(t, n)).toEqual(r);
  });

  it(`Resolves property "a" from root and leaves second property untouched`, () => {
    const n: NodeTailoredDescription = {
      language: "spec",
      name: "used",
      properties: {
        a: {
          type: "nodeDerivedProperty",
          loc: [],
          propName: "a",
        },
        b: "2",
      },
    };

    const r = Object.assign({}, n, {
      properties: { a: "1", b: "2" },
    }) as NodeDescription;
    expect(tailorBlockDescription(tRootWitha1, n)).toEqual(r);
  });

  it(`Error: Resolving property from unknown node`, () => {
    const invalidLoc: NodeLocation = [["nonexistant", 0]];
    const n: NodeTailoredDescription = {
      language: "spec",
      name: "used",
      properties: {
        a: {
          type: "nodeDerivedProperty",
          loc: invalidLoc,
          propName: "b",
        },
      },
    };
    expect(() => tailorBlockDescription(tRootWitha1, n)).toThrowError(
      new RegExp(JSON.stringify(invalidLoc))
    );
  });

  it(`Error: Resolving unknown property "b" from root`, () => {
    const n: NodeTailoredDescription = {
      language: "spec",
      name: "used",
      properties: {
        a: {
          type: "nodeDerivedProperty",
          loc: [],
          propName: "b",
        },
      },
    };
    expect(() => tailorBlockDescription(tRootWitha1, n)).toThrowError(
      /\[\].*property "b".*"a":"1"/
    );
  });

  const tRootTwoLeafs = new Tree({
    language: "spec",
    name: "root",
    properties: {
      a: "1",
    },
    children: {
      lhs: [
        { language: "spec", name: "t1", properties: { a: "2" } },
        { language: "spec", name: "t1", properties: { a: "3" } },
      ],
      rhs: [{ language: "spec", name: "t2", properties: { a: "4" } }],
    },
  });

  it(`Resolves property "a" from first child at "lhs"`, () => {
    const n: NodeTailoredDescription = {
      language: "spec",
      name: "used",
      properties: {
        a: {
          type: "nodeDerivedProperty",
          loc: [["lhs", 0]],
          propName: "a",
        },
      },
    };

    const r = Object.assign({}, n, {
      properties: { a: "2" },
    }) as NodeDescription;
    expect(tailorBlockDescription(tRootTwoLeafs, n)).toEqual(r);
  });

  it(`Resolves property "a" from second child at "lhs"`, () => {
    const n: NodeTailoredDescription = {
      language: "spec",
      name: "used",
      properties: {
        a: {
          type: "nodeDerivedProperty",
          loc: [["lhs", 1]],
          propName: "a",
        },
      },
    };

    const r = Object.assign({}, n, {
      properties: { a: "3" },
    }) as NodeDescription;
    expect(tailorBlockDescription(tRootTwoLeafs, n)).toEqual(r);
  });

  it(`Resolves property "a" from first child at "rhs"`, () => {
    const n: NodeTailoredDescription = {
      language: "spec",
      name: "used",
      properties: {
        a: {
          type: "nodeDerivedProperty",
          loc: [["rhs", 0]],
          propName: "a",
        },
      },
    };

    const r = Object.assign({}, n, {
      properties: { a: "4" },
    }) as NodeDescription;
    expect(tailorBlockDescription(tRootTwoLeafs, n)).toEqual(r);
  });

  it(`Child nodes with no tailored properties left unchanged`, () => {
    const n: NodeDescription = {
      language: "spec",
      name: "used",
      children: {
        lhs: [
          {
            language: "spec",
            name: "used",
            properties: {
              a: "2",
            },
          },
        ],
      },
    };
    expect(tailorBlockDescription(tRootWitha1, n)).toEqual(n);
  });

  it(`Node at [[lhs, 0]] resolves property "a" from root`, () => {
    const n: NodeTailoredDescription = {
      language: "spec",
      name: "used",
      children: {
        lhs: [
          {
            language: "spec",
            name: "used",
            properties: {
              a: {
                type: "nodeDerivedProperty",
                loc: [],
                propName: "a",
              },
            },
          },
        ],
      },
    };

    const exp: NodeDescription = {
      language: "spec",
      name: "used",
      children: {
        lhs: [{ language: "spec", name: "used", properties: { a: "1" } }],
      },
    };
    expect(tailorBlockDescription(tRootWitha1, n)).toEqual(exp);
  });

  it(`Node at [[lhs, 0]] resolves property "a" from root, succ unchanged`, () => {
    const n: NodeTailoredDescription = {
      language: "spec",
      name: "used",
      children: {
        lhs: [
          {
            language: "spec",
            name: "used",
            properties: {
              a: {
                type: "nodeDerivedProperty",
                loc: [],
                propName: "a",
              },
            },
          },
          {
            language: "spec",
            name: "used",
            properties: {
              a: "-1",
            },
          },
        ],
      },
    };

    const exp: NodeDescription = {
      language: "spec",
      name: "used",
      children: {
        lhs: [
          { language: "spec", name: "used", properties: { a: "1" } },
          { language: "spec", name: "used", properties: { a: "-1" } },
        ],
      },
    };
    expect(tailorBlockDescription(tRootWitha1, n)).toEqual(exp);
  });
});
