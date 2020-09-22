import { QualifiedNodeTypeDescription } from "../../syntaxtree/grammar-type-util";

import { buildAppearanceContext } from "./create-blocks";

describe(`Blockly block creation`, () => {
  describe(`buildAppearanceContext`, () => {
    const SQL_COLUMN: QualifiedNodeTypeDescription = {
      languageName: "sql",
      typeName: "column",
      type: "concrete",
      attributes: [],
    };

    it(`empty`, () => {
      const res = buildAppearanceContext([]);
      expect(res).toEqual({});
    });

    it(`No references`, () => {
      const res = buildAppearanceContext([
        {
          languageName: "l",
          typeName: "t",
          type: "concrete",
          attributes: [],
        },
        SQL_COLUMN,
      ]);
      expect(res).toEqual({});
    });

    it(`Short reference, no container`, () => {
      const res = buildAppearanceContext([
        {
          languageName: "sql",
          typeName: "select",
          type: "concrete",
          attributes: [
            {
              type: "sequence",
              name: "c",
              nodeTypes: ["column"],
            },
          ],
        },
        SQL_COLUMN,
      ]);
      expect(res).toEqual({
        "sql.column": { orientation: new Set(["horizontal"]) },
      });
    });

    it(`Long reference, no container`, () => {
      const res = buildAppearanceContext([
        {
          languageName: "sql",
          typeName: "select",
          type: "concrete",
          attributes: [
            {
              type: "sequence",
              name: "c",
              nodeTypes: [{ languageName: "sql", typeName: "column" }],
            },
          ],
        },
        SQL_COLUMN,
      ]);
      expect(res).toEqual({
        "sql.column": { orientation: new Set(["horizontal"]) },
      });
    });

    it(`Cardinality reference, no container`, () => {
      const res = buildAppearanceContext([
        {
          languageName: "sql",
          typeName: "select",
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
        SQL_COLUMN,
      ]);
      expect(res).toEqual({
        "sql.column": { orientation: new Set(["horizontal"]) },
      });
    });

    it(`Short reference to typedef`, () => {
      const res = buildAppearanceContext([
        {
          languageName: "sql",
          typeName: "select",
          type: "concrete",
          attributes: [
            {
              type: "sequence",
              name: "c",
              nodeTypes: ["expr"],
            },
          ],
        },
        {
          languageName: "sql",
          typeName: "expr",
          type: "oneOf",
          oneOf: [],
        },
      ]);
      expect(res).toEqual({});
    });

    it(`One horizontal container`, () => {
      const res = buildAppearanceContext([
        {
          languageName: "sql",
          typeName: "select",
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
        SQL_COLUMN,
      ]);
      expect(res).toEqual({
        "sql.column": { orientation: new Set(["horizontal"]) },
      });
    });

    it(`One horizontal container, one default`, () => {
      const res = buildAppearanceContext([
        {
          languageName: "sql",
          typeName: "select",
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
        {
          languageName: "sql",
          typeName: "functionCall",
          type: "concrete",
          attributes: [
            {
              type: "sequence",
              name: "c",
              nodeTypes: [{ languageName: "sql", typeName: "column" }],
            },
          ],
        },
        SQL_COLUMN,
      ]);
      expect(res).toEqual({
        "sql.column": { orientation: new Set(["horizontal"]) },
      });
    });

    it(`Vertical container`, () => {
      const res = buildAppearanceContext([
        {
          languageName: "sql",
          typeName: "select",
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
        SQL_COLUMN,
      ]);
      expect(res).toEqual({
        "sql.column": { orientation: new Set(["vertical"]) },
      });
    });

    it(`One vertical container, one default`, () => {
      const res = buildAppearanceContext([
        {
          languageName: "sql",
          typeName: "select",
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
        {
          languageName: "sql",
          typeName: "functionCall",
          type: "concrete",
          attributes: [
            {
              type: "sequence",
              name: "c",
              nodeTypes: [{ languageName: "sql", typeName: "column" }],
            },
          ],
        },
        SQL_COLUMN,
      ]);
      expect(res).toEqual({
        "sql.column": { orientation: new Set(["horizontal", "vertical"]) },
      });
    });
  });
});
