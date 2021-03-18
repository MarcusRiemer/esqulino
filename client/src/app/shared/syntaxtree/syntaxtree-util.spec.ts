import * as AST from "./syntaxtree";
import { mkSingleLanguageGrammar } from "./grammar.spec-util";
import { referencedResourceIds } from "./syntaxtree-util";

describe("syntaxtree-util.spec", () => {
  describe("referencedResourceIds", () => {
    const gDesc = mkSingleLanguageGrammar("l", "r", {
      r: {
        type: "concrete",
        attributes: [
          {
            type: "property",
            base: "codeResourceReference",
            name: "ref1",
          },
          {
            type: "property",
            base: "codeResourceReference",
            name: "ref2",
            isOptional: true,
          },
          {
            type: "property",
            base: "grammarReference",
            name: "grammarRef",
            isOptional: true,
          },
          {
            type: "sequence",
            name: "c",
            nodeTypes: [
              {
                nodeType: "r",
                occurs: "*",
              },
            ],
          },
        ],
      },
    });

    it("No node at all", () => {
      expect(
        referencedResourceIds(undefined, gDesc, "codeResourceReference")
      ).toEqual([]);
    });

    it("Single node with single reference", () => {
      const ref1 = "3d52ddf6-6d81-4158-9f66-365ad5adea90";

      const n = new AST.SyntaxTree({
        language: "l",
        name: "r",
        properties: { ref1 },
      }).rootNode;

      expect(referencedResourceIds(n, gDesc, "codeResourceReference")).toEqual([
        ref1,
      ]);
    });

    it("Single node with single reference to grammar", () => {
      const grammarRef = "3d52ddf6-6d81-4158-9f66-365ad5adea90";

      const n = new AST.SyntaxTree({
        language: "l",
        name: "r",
        properties: { grammarRef },
      }).rootNode;

      expect(referencedResourceIds(n, gDesc, "grammarReference")).toEqual([
        grammarRef,
      ]);
    });

    it("Single node with two references", () => {
      const ref1 = "3d52ddf6-6d81-4158-9f66-365ad5adea90";
      const ref2 = "6bbe0185-ca19-44a8-8003-30edc34b0c8b";

      const n = new AST.SyntaxTree({
        language: "l",
        name: "r",
        properties: { ref1, ref2 },
      }).rootNode;

      expect(referencedResourceIds(n, gDesc, "codeResourceReference")).toEqual([
        ref1,
        ref2,
      ]);
    });

    it("Two nodes each with single reference", () => {
      const ref1 = "3d52ddf6-6d81-4158-9f66-365ad5adea90";
      const ref2 = "6bbe0185-ca19-44a8-8003-30edc34b0c8b";

      const n = new AST.SyntaxTree({
        language: "l",
        name: "r",
        properties: { ref1 },
        children: {
          c: [{ language: "l", name: "r", properties: { ref1: ref2 } }],
        },
      }).rootNode;

      expect(referencedResourceIds(n, gDesc, "codeResourceReference")).toEqual([
        ref1,
        ref2,
      ]);
    });

    it("Two nodes, child with two references", () => {
      const ref1 = "3d52ddf6-6d81-4158-9f66-365ad5adea90";
      const ref2_1 = "6bbe0185-ca19-44a8-8003-30edc34b0c8b";
      const ref2_2 = "95fbb491-89d8-4d7e-9667-93302ba6763b";

      const n = new AST.SyntaxTree({
        language: "l",
        name: "r",
        properties: { ref1 },
        children: {
          c: [
            {
              language: "l",
              name: "r",
              properties: { ref1: ref2_1, ref2: ref2_2 },
            },
          ],
        },
      }).rootNode;

      expect(referencedResourceIds(n, gDesc, "codeResourceReference")).toEqual([
        ref1,
        ref2_1,
        ref2_2,
      ]);
    });
  });
});
