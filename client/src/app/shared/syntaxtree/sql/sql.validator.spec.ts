import * as AST from '../syntaxtree'
import { Validator, ErrorCodes } from '../validator'

import { LANG_DESCRIPTION } from './sql.validator'

describe("Language: SQL (Validation)", () => {
  it("Invalid: Empty SELECT-query", () => {
    const v = new Validator([LANG_DESCRIPTION]);

    const astDesc: AST.NodeDescription = {
      language: "sql",
      name: "querySelect",
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(2);
    expect(res.errors[0].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[1].code).toEqual(ErrorCodes.MissingChild);
  });

  it("Valid: SELECT * FROM foo", () => {
    const v = new Validator([LANG_DESCRIPTION]);

    const astDesc: AST.NodeDescription = {
      language: "sql",
      name: "querySelect",
      children: {
        "components": [
          {
            language: "sql",
            name: "select",
            children: {
              "expressions": [
                {
                  language: "sql",
                  name: "starOperator"
                }
              ]
            }
          },
          {
            language: "sql",
            name: "from",
            children: {
              "tables": [
                {
                  language: "sql",
                  name: "tableName",
                  properties: {
                    "name": "foo"
                  }
                }
              ]
            }
          }
        ]
      }
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(0);
  });

  it("Valid: SELECT * FROM foo, bar", () => {
    const v = new Validator([LANG_DESCRIPTION]);

    const astDesc: AST.NodeDescription = {
      language: "sql",
      name: "querySelect",
      children: {
        "components": [
          {
            language: "sql",
            name: "select",
            children: {
              "expressions": [
                {
                  language: "sql",
                  name: "starOperator"
                }
              ]
            }
          },
          {
            language: "sql",
            name: "from",
            children: {
              "tables": [
                {
                  language: "sql",
                  name: "tableName",
                  properties: {
                    "name": "foo"
                  }
                },
                {
                  language: "sql",
                  name: "crossJoin",
                  children: {
                    "table": [
                      {
                        "language": "sql",
                        "name": "tableName",
                        properties: {
                          "name": "bar"
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(0);
  });

  it("Valid: SELECT * FROM foo, bar WHERE foo.id = bar.id", () => {
    const v = new Validator([LANG_DESCRIPTION]);

    const astDesc: AST.NodeDescription = {
      language: "sql",
      name: "querySelect",
      children: {
        "components": [
          {
            language: "sql",
            name: "select",
            children: {
              "expressions": [
                {
                  language: "sql",
                  name: "starOperator"
                }
              ]
            }
          },
          {
            language: "sql",
            name: "from",
            children: {
              "tables": [
                {
                  language: "sql",
                  name: "tableName",
                  properties: {
                    "name": "foo"
                  }
                },
                {
                  language: "sql",
                  name: "crossJoin",
                  children: {
                    "table": [
                      {
                        "language": "sql",
                        "name": "tableName",
                        properties: {
                          "name": "bar"
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            language: "sql",
            name: "where",
            children: {
              "expressions": [
                {
                  language: "sql",
                  name: "binaryExpression",
                  children: {
                    "operands": [
                      {
                        language: "sql",
                        name: "columnName",
                        properties: {
                          "columnName": "id",
                          "refTableName": "foo"
                        }
                      },
                      {
                        language: "sql",
                        name: "relationalOperator",
                        properties: {
                          "operator": "="
                        }
                      },
                      {
                        language: "sql",
                        name: "columnName",
                        properties: {
                          "columnName": "id",
                          "refTableName": "bar"
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    debugger;

    expect(res.errors.length).toEqual(0);
  });
});
