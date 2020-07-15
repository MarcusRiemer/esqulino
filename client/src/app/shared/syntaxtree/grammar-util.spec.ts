import { resolveChildOccurs, isHoleIfEmpty } from "./grammar-util";

describe(`Grammar Utilities`, () => {
  describe(`resolveOccurs`, () => {
    it(`t1 | g1.t1 => 1`, () => {
      expect(resolveChildOccurs("a")).toEqual({ minOccurs: 1, maxOccurs: 1 });
    });

    it(`t1* | g1.t1* => 0..Inf`, () => {
      expect(resolveChildOccurs({ nodeType: "t1", occurs: "*" })).toEqual({
        minOccurs: 0,
        maxOccurs: +Infinity,
      });

      expect(
        resolveChildOccurs({
          nodeType: { languageName: "g1", typeName: "t1" },
          occurs: "*",
        })
      ).toEqual({ minOccurs: 0, maxOccurs: +Infinity });
    });

    it(`t1+ | g1.t1+ => 1..Inf`, () => {
      expect(resolveChildOccurs({ nodeType: "t1", occurs: "*" })).toEqual({
        minOccurs: 0,
        maxOccurs: +Infinity,
      });

      expect(
        resolveChildOccurs({
          nodeType: { languageName: "g1", typeName: "t1" },
          occurs: "*",
        })
      ).toEqual({ minOccurs: 0, maxOccurs: +Infinity });
    });

    it(`t1? | g1.t1? => 0..1`, () => {
      expect(resolveChildOccurs({ nodeType: "t1", occurs: "?" })).toEqual({
        minOccurs: 0,
        maxOccurs: 1,
      });

      expect(
        resolveChildOccurs({
          nodeType: { languageName: "g1", typeName: "t1" },
          occurs: "?",
        })
      ).toEqual({ minOccurs: 0, maxOccurs: 1 });
    });

    it(`t1{3,5} | g1.t1{3,5} => 3..5`, () => {
      expect(
        resolveChildOccurs({
          nodeType: "t1",
          occurs: { minOccurs: 3, maxOccurs: 5 },
        })
      ).toEqual({ minOccurs: 3, maxOccurs: 5 });

      expect(
        resolveChildOccurs({
          nodeType: { languageName: "g1", typeName: "t1" },
          occurs: { minOccurs: 3, maxOccurs: 5 },
        })
      ).toEqual({ minOccurs: 3, maxOccurs: 5 });
    });
  });

  describe(`isHoleIfEmpty`, () => {
    it(`Sequence: t1`, () => {
      expect(
        isHoleIfEmpty({
          type: "sequence",
          name: "a1",
          nodeTypes: ["t1"],
        })
      ).toBe(true);
    });

    it(`Sequence: t1? t2?`, () => {
      expect(
        isHoleIfEmpty({
          type: "sequence",
          name: "a1",
          nodeTypes: [
            { nodeType: "t1", occurs: "?" },
            { nodeType: "t2", occurs: "?" },
          ],
        })
      ).toBe(false);
    });

    it(`Allowed: t1`, () => {
      expect(
        isHoleIfEmpty({
          type: "allowed",
          name: "a1",
          nodeTypes: ["t1"],
        })
      ).toBe(true);
    });

    it(`Allowed: t1? t2?`, () => {
      expect(
        isHoleIfEmpty({
          type: "allowed",
          name: "a1",
          nodeTypes: [
            { nodeType: "t1", occurs: "?" },
            { nodeType: "t2", occurs: "?" },
          ],
        })
      ).toBe(false);
    });

    it(`choice`, () => {
      expect(
        isHoleIfEmpty({
          type: "choice",
          name: "a1",
          choices: [
            { languageName: "g", typeName: "t1" },
            { languageName: "g", typeName: "t2" },
          ],
        })
      ).toBe(true);
    });
  });
});
