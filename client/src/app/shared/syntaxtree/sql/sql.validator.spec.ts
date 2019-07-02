import { SqlValidator, DatabaseSchemaAdditionalContext } from './sql.validator'

import { SPEC_TABLES } from '../../schema/schema.spec'
import { Schema } from '../../schema/schema'
import { NodeDescription } from '../syntaxtree.description';
import { Node } from '../syntaxtree';
import { ValidationContext } from '../validation-result';

function specContext(schemaDescription = SPEC_TABLES): DatabaseSchemaAdditionalContext {
  return ({
    databaseSchema: new Schema(schemaDescription)
  });
}

function createTreeWithCall(funcName: string, colNames: string[]): NodeDescription {
  return ({
    "name": "querySelect",
    "language": "sql",
    "children": {
      "select": [
        {
          "name": "select",
          "language": "sql",
          "children": {
            "columns": [
              {
                "name": "functionCall",
                "language": "sql",
                "properties": {
                  "name": funcName,
                },
                "children": {
                  "arguments": colNames.map((col): NodeDescription => {
                    return ({
                      "language": "sql",
                      "name": "columnName",
                      "properties": {
                        "columnName": col,
                        "refTableName": "ereignis"
                      }
                    })
                  })
                }
              }
            ]
          }
        }
      ],
      "from": [
        {
          "name": "from",
          "language": "sql",
          "children": {
            "tables": [
              {
                "name": "tableIntroduction",
                "language": "sql",
                "properties": {
                  "name": "ereignis"
                }
              }
            ]
          }
        }
      ]
    }
  });
}

describe(`Specialized SQL Validator`, () => {
  it(`Error: UNKNOWN_TABLE`, () => {
    const context = new ValidationContext(specContext());
    const sqlValidator = new SqlValidator();

    const astDesc: NodeDescription = {
      "name": "querySelect",
      "language": "sql",
      "children": {
        "from": [
          {
            "name": "from",
            "language": "sql",
            "children": {
              "tables": [
                {
                  "name": "tableIntroduction",
                  "language": "sql",
                  "properties": {
                    "name": "ereignis2"
                  }
                }
              ]
            }
          }
        ]
      }
    };

    const ast = new Node(astDesc, undefined);
    sqlValidator.validateFromRoot(ast, context);

    expect(context.errors.length).toEqual(1);
    expect(context.errors[0].code).toEqual("UNKNOWN_TABLE");
  });

  it(`Error: DUPLICATE_TABLE_NAME`, () => {
    const context = new ValidationContext(specContext());
    const sqlValidator = new SqlValidator();

    const astDesc: NodeDescription = {
      "name": "querySelect",
      "language": "sql",
      "children": {
        "from": [
          {
            "name": "from",
            "language": "sql",
            "children": {
              "tables": [
                {
                  "name": "tableIntroduction",
                  "language": "sql",
                  "properties": {
                    "name": "ereignis"
                  }
                },
                {
                  "name": "tableIntroduction",
                  "language": "sql",
                  "properties": {
                    "name": "ereignis"
                  }
                }
              ]
            }
          }
        ]
      }
    };

    const ast = new Node(astDesc, undefined);
    sqlValidator.validateFromRoot(ast, context);

    expect(context.errors.length).toEqual(1);
    expect(context.errors[0].code).toEqual("DUPLICATE_TABLE_NAME");
  });

  it(`Error: DUPLICATE_TABLE_NAME, UNKNOWN_TABLE`, () => {
    const context = new ValidationContext(specContext());
    const sqlValidator = new SqlValidator();

    const astDesc: NodeDescription = {
      "name": "querySelect",
      "language": "sql",
      "children": {
        "from": [
          {
            "name": "from",
            "language": "sql",
            "children": {
              "tables": [
                {
                  "name": "tableIntroduction",
                  "language": "sql",
                  "properties": {
                    "name": "unknown"
                  }
                },
                {
                  "name": "tableIntroduction",
                  "language": "sql",
                  "properties": {
                    "name": "unknown"
                  }
                }
              ]
            }
          }
        ]
      }
    };

    const ast = new Node(astDesc, undefined);
    sqlValidator.validateFromRoot(ast, context);

    expect(context.errors.length).toEqual(3);
    expect(context.errors[0].code).toEqual("UNKNOWN_TABLE", 0);
    expect(context.errors[1].code).toEqual("UNKNOWN_TABLE", 1);
    expect(context.errors[2].code).toEqual("DUPLICATE_TABLE_NAME", 2);
  });

  // Deactivated for the moment, error doesn't seem to be very helpful
  xit(`Error: AGGREGATION_WITHOUT_GROUP_BY`, () => {
    const context = new ValidationContext(specContext());
    const sqlValidator = new SqlValidator();

    const astDesc: NodeDescription = {
      "name": "querySelect",
      "language": "sql",
      "children": {
        "select": [
          {
            "name": "select",
            "language": "sql",
            "children": {
              "columns": [
                {
                  "name": "functionCall",
                  "language": "sql",
                  "properties": {
                    "name": "COUNT"
                  },
                  "children": {
                    "arguments": []
                  }
                }
              ]
            }
          }
        ],
        "from": [
          {
            "name": "from",
            "language": "sql",
            "children": {
              "tables": [
                {
                  "name": "tableIntroduction",
                  "language": "sql",
                  "properties": {
                    "name": "ereignis"
                  }
                }
              ]
            }
          }
        ]
      }
    };

    const ast = new Node(astDesc, undefined);
    sqlValidator.validateFromRoot(ast, context);

    expect(context.errors.map(e => e.code)).toEqual(["AGGREGATION_WITHOUT_GROUP_BY"]);
  });

  describe("function argument count", () => {
    const spec = (funcName: string, argColumns: string[], expectedCodes: string[]) => {
      it(`${funcName}(${argColumns.join(", ")}) => [${expectedCodes.join(", ")}]`, () => {
        const context = new ValidationContext(specContext());
        const sqlValidator = new SqlValidator();

        const astDesc: NodeDescription = createTreeWithCall(funcName, argColumns);

        const ast = new Node(astDesc, undefined);
        sqlValidator.validateFromRoot(ast, context);

        expect(context.errors.map(e => e.code)).toEqual(expectedCodes);
      });
    }

    spec("sum", [], ["INVALID_NUMBER_OF_ARGUMENTS"]);
    spec("sum", ["ereignis_id"], []);
    spec("sum", ["ereignis_id", "bezeichnung"], ["INVALID_NUMBER_OF_ARGUMENTS"]);
    spec("min", [], ["INVALID_NUMBER_OF_ARGUMENTS"]);
    spec("min", ["ereignis_id"], []);
    spec("min", ["ereignis_id", "bezeichnung"], ["INVALID_NUMBER_OF_ARGUMENTS"]);
    spec("max", [], ["INVALID_NUMBER_OF_ARGUMENTS"]);
    spec("max", ["ereignis_id"], []);
    spec("max", ["ereignis_id", "bezeichnung"], ["INVALID_NUMBER_OF_ARGUMENTS"]);
    spec("count", [], []);
    spec("count", ["ereignis_id"], []);
    spec("count", ["ereignis_id", "bezeichnung"], []);
  });
});
