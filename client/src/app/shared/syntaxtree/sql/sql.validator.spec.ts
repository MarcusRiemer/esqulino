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

describe(`Specialized SQL Validator`, () => {
  it(`Error: EMPTY_SELECT`, () => {
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
              "columns": []
            }
          }
        ]
      }
    };

    const ast = new Node(astDesc, undefined);
    sqlValidator.validateFromRoot(ast, context);

    expect(context.errors.length).toEqual(1);
    expect(context.errors[0].code).toEqual("EMPTY_SELECT");
  });

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

  it(`Error: AGGREGATION_WITHOUT_GROUP_BY`, () => {
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

    expect(context.errors.length).toEqual(1);
    expect(context.errors[0].code).toEqual("AGGREGATION_WITHOUT_GROUP_BY");
  });
});
