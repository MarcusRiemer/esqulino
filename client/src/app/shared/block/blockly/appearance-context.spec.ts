import { buildAppearanceContext } from "./appearance-context";
import { NodeTypeDescription, NamedLanguages } from "../../syntaxtree";

describe(`Blockly Appearance Context`, () => {
  describe(`buildAppearanceContext`, () => {
    const EMPTY_CONCRETE_TYPE: NodeTypeDescription = {
      type: "concrete",
      attributes: [],
    };

    it(`empty`, () => {
      const res = buildAppearanceContext({});
      expect(res.typeDetails).toEqual({});
    });

    it(`No references`, () => {
      const res = buildAppearanceContext({
        l: {
          t: EMPTY_CONCRETE_TYPE,
        },
        sql: {
          column: EMPTY_CONCRETE_TYPE,
        },
      });
      expect(res.typeDetails).toEqual({});
    });

    it(`Short reference, no container`, () => {
      const res = buildAppearanceContext({
        sql: {
          select: {
            type: "concrete",
            attributes: [
              {
                type: "sequence",
                name: "c",
                nodeTypes: ["column"],
              },
            ],
          },
          column: EMPTY_CONCRETE_TYPE,
        },
      });
      expect(res.typeDetails).toEqual({
        "sql.column": { orientation: new Set(["horizontal"]) },
      });
    });

    it(`Long reference, no container`, () => {
      const res = buildAppearanceContext({
        sql: {
          select: {
            type: "concrete",
            attributes: [
              {
                type: "sequence",
                name: "c",
                nodeTypes: [{ languageName: "sql", typeName: "column" }],
              },
            ],
          },
          column: EMPTY_CONCRETE_TYPE,
        },
      });

      expect(res.typeDetails).toEqual({
        "sql.column": { orientation: new Set(["horizontal"]) },
      });
    });

    it(`Cardinality reference, no container`, () => {
      const res = buildAppearanceContext({
        sql: {
          select: {
            type: "concrete",
            attributes: [
              {
                type: "sequence",
                name: "c",
                nodeTypes: [
                  {
                    nodeType: { languageName: "sql", typeName: "column" },
                    occurs: "+",
                  },
                ],
              },
            ],
          },
          column: EMPTY_CONCRETE_TYPE,
        },
      });
      expect(res.typeDetails).toEqual({
        "sql.column": { orientation: new Set(["horizontal"]) },
      });
    });

    it(`Short reference to typedef`, () => {
      const res = buildAppearanceContext({
        sql: {
          select: {
            type: "concrete",
            attributes: [
              {
                type: "sequence",
                name: "c",
                nodeTypes: ["expr"],
              },
            ],
          },
          expr: {
            type: "oneOf",
            oneOf: [],
          },
        },
      });
      expect(res.typeDetails).toEqual({});
    });

    it(`One horizontal container`, () => {
      const res = buildAppearanceContext({
        sql: {
          select: {
            type: "concrete",
            attributes: [
              {
                type: "container",
                orientation: "horizontal",
                children: [
                  {
                    type: "sequence",
                    name: "c",
                    nodeTypes: ["column"],
                  },
                ],
              },
            ],
          },
          column: EMPTY_CONCRETE_TYPE,
        },
      });
      expect(res.typeDetails).toEqual({
        "sql.column": { orientation: new Set(["horizontal"]) },
      });
    });

    it(`One horizontal container, one default`, () => {
      const res = buildAppearanceContext({
        sql: {
          select: {
            type: "concrete",
            attributes: [
              {
                type: "container",
                orientation: "horizontal",
                children: [
                  {
                    type: "sequence",
                    name: "c",
                    nodeTypes: ["column"],
                  },
                ],
              },
            ],
          },
          functionCall: {
            type: "concrete",
            attributes: [
              {
                type: "sequence",
                name: "c",
                nodeTypes: [{ languageName: "sql", typeName: "column" }],
              },
            ],
          },
          column: EMPTY_CONCRETE_TYPE,
        },
      });
      expect(res.typeDetails).toEqual({
        "sql.column": { orientation: new Set(["horizontal"]) },
      });
    });

    it(`Vertical container`, () => {
      const res = buildAppearanceContext({
        sql: {
          select: {
            type: "concrete",
            attributes: [
              {
                type: "container",
                orientation: "vertical",
                children: [
                  {
                    type: "sequence",
                    name: "c",
                    nodeTypes: ["column"],
                  },
                ],
              },
            ],
          },
          column: EMPTY_CONCRETE_TYPE,
        },
      });
      expect(res.typeDetails).toEqual({
        "sql.column": { orientation: new Set(["vertical"]) },
      });
    });

    it(`One vertical container, one default`, () => {
      const args: NamedLanguages = {
        sql: {
          select: {
            type: "concrete",
            attributes: [
              {
                type: "container",
                orientation: "vertical",
                children: [
                  {
                    type: "sequence",
                    name: "c",
                    nodeTypes: ["column"],
                  },
                ],
              },
            ],
          },
          functionCall: {
            type: "concrete",
            attributes: [
              {
                type: "sequence",
                name: "c",
                nodeTypes: [{ languageName: "sql", typeName: "column" }],
              },
            ],
          },
          column: EMPTY_CONCRETE_TYPE,
        },
      };

      expect(() => buildAppearanceContext(args)).toThrowError();

      const res = buildAppearanceContext(args, false);
      expect(res.typeDetails).toEqual({
        "sql.column": { orientation: new Set(["horizontal", "vertical"]) },
      });
    });
  });
});
