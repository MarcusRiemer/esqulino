import { readableConstants } from "./spec-util";

describe("BlockLanguage Spec Utilities", () => {
  describe("readableConstants()", () => {
    it(`"a"`, () => {
      const r = readableConstants([{ blockType: "constant", text: "a" }]);

      expect(r).toEqual("a");
    });

    it(`"ab"`, () => {
      const r = readableConstants([
        { blockType: "constant", text: "a" },
        { blockType: "constant", text: "b" },
      ]);

      expect(r).toEqual("ab");
    });

    it(`"<block>a</block>"`, () => {
      const r = readableConstants([
        {
          blockType: "block",
          children: [{ blockType: "constant", text: "a" }],
        },
      ]);

      expect(r).toEqual("<block>a</block>");
    });
  });
});
