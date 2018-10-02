import * as AST from '../../../shared/syntaxtree';

import { calculateDropLocation } from './drop-utils'

describe("Drop location calculation", () => {
  const defaultTree = new AST.Tree({
    language: "spec",
    name: "root",
    children: {
      "c0": [
        {
          language: "spec",
          name: "c0_0"
        }
      ],
      "c1": [
        {
          language: "spec",
          name: "c1_0"
        },
        {
          language: "spec",
          name: "c1_1"
        },
        {
          language: "spec",
          name: "c1_2"
        }
      ],
      "c2": []
    }
  });

  it("with missing parameters", () => {
    expect(calculateDropLocation(undefined, { self: { order: "insertBefore", skipParents: 0 } })).toBeUndefined();
    expect(calculateDropLocation(defaultTree.locate([["c0", 0]]), undefined)).toEqual([["c0", 1]]);
  });

  it("on self", () => {
    const n1 = defaultTree.locate([["c0", 0]]);
    expect(calculateDropLocation(n1, { self: { order: "insertBefore", skipParents: 0 } })).toEqual([["c0", 0]]);
    expect(calculateDropLocation(n1, { self: { order: "insertAfter", skipParents: 0 } })).toEqual([["c0", 1]]);

    const n2 = defaultTree.locate([["c1", 1]]);
    expect(calculateDropLocation(n2, { self: { order: "insertBefore", skipParents: 0 } })).toEqual([["c1", 1]]);
    expect(calculateDropLocation(n2, { self: { order: "insertAfter", skipParents: 0 } })).toEqual([["c1", 2]]);
  });

  it("on parent", () => {
    const n1 = defaultTree.locate([["c0", 0]]);
    expect(calculateDropLocation(n1, { parent: { category: "c1", order: "insertFirst" } })).toEqual([["c1", 0]]);
    expect(calculateDropLocation(n1, { parent: { category: "c1", order: "insertLast" } })).toEqual([["c1", 3]]);

    expect(calculateDropLocation(n1, { parent: { category: "c2", order: "insertFirst" } })).toEqual([["c2", 0]]);
    expect(calculateDropLocation(n1, { parent: { category: "c2", order: "insertLast" } })).toEqual([["c2", 0]]);
  });

  it("on child", () => {
    const r = defaultTree.locate([]);
    expect(calculateDropLocation(r, { children: { category: "c1", order: "insertFirst" } })).toEqual([["c1", 0]]);
    expect(calculateDropLocation(r, { children: { category: "c1", order: "insertLast" } })).toEqual([["c1", 3]]);

    expect(calculateDropLocation(r, { children: { category: "c2", order: "insertFirst" } })).toEqual([["c2", 0]]);
    expect(calculateDropLocation(r, { children: { category: "c2", order: "insertLast" } })).toEqual([["c2", 0]]);
  });
});
