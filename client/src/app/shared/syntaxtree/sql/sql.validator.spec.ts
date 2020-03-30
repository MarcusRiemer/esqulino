import { SqlValidator, DatabaseSchemaAdditionalContext } from "./sql.validator";

import { SPEC_TABLES } from "../../schema/schema.spec";
import { Schema } from "../../schema/schema";
import { NodeDescription } from "../syntaxtree.description";
import { Node } from "../syntaxtree";
import { ValidationContext } from "../validation-result";

function specContext(
  schemaDescription = SPEC_TABLES,
  validateGroupBy = false
): DatabaseSchemaAdditionalContext {
  return {
    databaseSchema: new Schema(schemaDescription),
    validateGroupBy,
  };
}

function createTreeWithCall(
  funcName: string,
  colNames: string[]
): NodeDescription {
  return {
    name: "querySelect",
    language: "sql",
    children: {
      select: [
        {
          name: "select",
          language: "sql",
          children: {
            columns: [
              {
                name: "functionCall",
                language: "sql",
                properties: {
                  name: funcName,
                },
                children: {
                  arguments: colNames.map(
                    (col): NodeDescription => {
                      return {
                        language: "sql",
                        name: "columnName",
                        properties: {
                          columnName: col,
                          refTableName: "ereignis",
                        },
                      };
                    }
                  ),
                },
              },
            ],
          },
        },
      ],
      from: [
        {
          name: "from",
          language: "sql",
          children: {
            tables: [
              {
                name: "tableIntroduction",
                language: "sql",
                properties: {
                  name: "ereignis",
                },
              },
            ],
          },
        },
      ],
    },
  };
}

describe(`Specialized SQL Validator`, () => {
  describe(`Error: UNKNOWN_TABLE`, () => {
    const sqlValidator = new SqlValidator();

    const astDesc: NodeDescription = {
      name: "querySelect",
      language: "sql",
      children: {
        from: [
          {
            name: "from",
            language: "sql",
            children: {
              tables: [
                {
                  name: "tableIntroduction",
                  language: "sql",
                  properties: {
                    name: "ereignis2",
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const ast = new Node(astDesc, undefined);

    it(`With schema`, () => {
      const context = new ValidationContext(specContext());
      sqlValidator.validateFromRoot(ast, context);

      expect(context.errors.map((e) => e.code)).toEqual(["UNKNOWN_TABLE"]);
    });

    it(`Without schema`, () => {
      const context = new ValidationContext({});
      sqlValidator.validateFromRoot(ast, context);

      expect(context.errors.map((e) => e.code)).toEqual([]);
    });
  });

  describe(`Error: DUPLICATE_TABLE_NAME`, () => {
    const astDesc: NodeDescription = {
      name: "querySelect",
      language: "sql",
      children: {
        from: [
          {
            name: "from",
            language: "sql",
            children: {
              tables: [
                {
                  name: "tableIntroduction",
                  language: "sql",
                  properties: {
                    name: "ereignis",
                  },
                },
                {
                  name: "tableIntroduction",
                  language: "sql",
                  properties: {
                    name: "ereignis",
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const ast = new Node(astDesc, undefined);
    const sqlValidator = new SqlValidator();

    it(`With schema`, () => {
      const context = new ValidationContext(specContext());
      sqlValidator.validateFromRoot(ast, context);
      expect(context.errors.map((e) => e.code)).toEqual([
        "DUPLICATE_TABLE_NAME",
      ]);
    });

    it(`Without schema`, () => {
      const context = new ValidationContext({});
      sqlValidator.validateFromRoot(ast, context);
      expect(context.errors.map((e) => e.code)).toEqual([
        "DUPLICATE_TABLE_NAME",
      ]);
    });
  });

  describe(`Error: TABLE_NOT_IN_FROM`, () => {
    const astDesc: NodeDescription = {
      name: "querySelect",
      language: "sql",
      children: {
        select: [
          {
            name: "select",
            language: "sql",
            children: {
              columns: [
                {
                  language: "sql",
                  name: "columnName",
                  properties: {
                    columnName: "name",
                    refTableName: "person",
                  },
                },
              ],
            },
          },
        ],
        from: [
          {
            name: "from",
            language: "sql",
            children: {
              tables: [
                {
                  name: "tableIntroduction",
                  language: "sql",
                  properties: {
                    name: "ereignis",
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const ast = new Node(astDesc, undefined);
    const sqlValidator = new SqlValidator();

    it(`With schema`, () => {
      const context = new ValidationContext(specContext());
      sqlValidator.validateFromRoot(ast, context);
      expect(context.errors.map((e) => e.code)).toEqual(["TABLE_NOT_IN_FROM"]);
    });

    it(`Without schema`, () => {
      const context = new ValidationContext({});
      sqlValidator.validateFromRoot(ast, context);
      expect(context.errors.map((e) => e.code)).toEqual(["TABLE_NOT_IN_FROM"]);
    });
  });

  describe(`Error: UNKNOWN_COLUMN`, () => {
    const astDesc: NodeDescription = {
      name: "querySelect",
      language: "sql",
      children: {
        select: [
          {
            name: "select",
            language: "sql",
            children: {
              columns: [
                {
                  language: "sql",
                  name: "columnName",
                  properties: {
                    columnName: "doesntexist",
                    refTableName: "ereignis",
                  },
                },
              ],
            },
          },
        ],
        from: [
          {
            name: "from",
            language: "sql",
            children: {
              tables: [
                {
                  name: "tableIntroduction",
                  language: "sql",
                  properties: {
                    name: "ereignis",
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const ast = new Node(astDesc, undefined);
    const sqlValidator = new SqlValidator();

    it(`With schema`, () => {
      const context = new ValidationContext(specContext());
      sqlValidator.validateFromRoot(ast, context);
      expect(context.errors.map((e) => e.code)).toEqual(["UNKNOWN_COLUMN"]);
    });

    it(`Without schema`, () => {
      const context = new ValidationContext({});
      sqlValidator.validateFromRoot(ast, context);
      expect(context.errors.map((e) => e.code)).toEqual([]);
    });
  });

  describe(`Error: DUPLICATE_TABLE_NAME, UNKNOWN_TABLE`, () => {
    const sqlValidator = new SqlValidator();

    const astDesc: NodeDescription = {
      name: "querySelect",
      language: "sql",
      children: {
        from: [
          {
            name: "from",
            language: "sql",
            children: {
              tables: [
                {
                  name: "tableIntroduction",
                  language: "sql",
                  properties: {
                    name: "unknown",
                  },
                },
                {
                  name: "tableIntroduction",
                  language: "sql",
                  properties: {
                    name: "unknown",
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const ast = new Node(astDesc, undefined);

    it(`Error: DUPLICATE_TABLE_NAME, UNKNOWN_TABLE`, () => {
      const context = new ValidationContext(specContext());
      sqlValidator.validateFromRoot(ast, context);
      expect(context.errors.map((e) => e.code)).toEqual([
        "UNKNOWN_TABLE",
        "UNKNOWN_TABLE",
        "DUPLICATE_TABLE_NAME",
      ]);
    });

    it(`Error: DUPLICATE_TABLE_NAME, UNKNOWN_TABLE`, () => {
      const context = new ValidationContext({});
      sqlValidator.validateFromRoot(ast, context);
      expect(context.errors.map((e) => e.code)).toEqual([
        "DUPLICATE_TABLE_NAME",
      ]);
    });
  });

  it(`Error: AGGREGATION_WITHOUT_GROUP_BY`, () => {
    const context = new ValidationContext(specContext(SPEC_TABLES, true));
    const sqlValidator = new SqlValidator();

    const astDesc: NodeDescription = {
      name: "querySelect",
      language: "sql",
      children: {
        select: [
          {
            name: "select",
            language: "sql",
            children: {
              columns: [
                {
                  name: "functionCall",
                  language: "sql",
                  properties: {
                    name: "COUNT",
                  },
                  children: {
                    arguments: [],
                  },
                },
              ],
            },
          },
        ],
        from: [
          {
            name: "from",
            language: "sql",
            children: {
              tables: [
                {
                  name: "tableIntroduction",
                  language: "sql",
                  properties: {
                    name: "ereignis",
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const ast = new Node(astDesc, undefined);
    sqlValidator.validateFromRoot(ast, context);

    expect(context.errors.map((e) => e.code)).toEqual([
      "AGGREGATION_WITHOUT_GROUP_BY",
    ]);
  });

  describe("function argument count", () => {
    const spec = (
      funcName: string,
      argColumns: string[],
      expectedCodes: string[]
    ) => {
      it(`${funcName}(${argColumns.join(", ")}) => [${expectedCodes.join(
        ", "
      )}]`, () => {
        const context = new ValidationContext(specContext());
        const sqlValidator = new SqlValidator();

        const astDesc: NodeDescription = createTreeWithCall(
          funcName,
          argColumns
        );

        const ast = new Node(astDesc, undefined);
        sqlValidator.validateFromRoot(ast, context);

        expect(context.errors.map((e) => e.code)).toEqual(expectedCodes);
      });
    };

    spec("sum", [], ["MISSING_CHILD"]);
    spec("SUM", ["ereignis_id"], []);
    spec("sUm", ["ereignis_id", "bezeichnung"], ["MISSING_CHILD"]);
    spec("min", [], ["MISSING_CHILD"]);
    spec("MIN", ["ereignis_id"], []);
    spec("miN", ["ereignis_id", "bezeichnung"], ["MISSING_CHILD"]);
    spec("max", [], ["MISSING_CHILD"]);
    spec("MAX", ["ereignis_id"], []);
    spec("Max", ["ereignis_id", "bezeichnung"], ["MISSING_CHILD"]);
    spec("count", [], []);
    spec("COUNT", ["ereignis_id"], []);
    spec("CounT", ["ereignis_id", "bezeichnung"], []);

    spec("invalid", [], []);
    spec("INVALID", ["ereignis_id"], []);
    spec("inVAliD", ["ereignis_id", "bezeichnung"], []);
  });
});
