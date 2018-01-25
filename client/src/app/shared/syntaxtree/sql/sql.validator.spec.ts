import * as AST from '../syntaxtree'
import { Validator, ErrorCodes } from '../validator'

import { GRAMMAR_DESCRIPTION } from './sql.validator'

describe("Language: SQL (Validation)", () => {
  it("Invalid: Empty SELECT-query", () => {
    const v = new Validator([GRAMMAR_DESCRIPTION]);

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
    const v = new Validator([GRAMMAR_DESCRIPTION]);

    const astDesc: AST.NodeDescription = {
      language: "sql",
      name: "querySelect",
      children: {
        "select": [
          {
            language: "sql",
            name: "select",
            children: {
              "columns": [
                {
                  language: "sql",
                  name: "starOperator"
                }
              ]
            }
          }
        ],
        "from": [
          {
            language: "sql",
            name: "from",
            children: {
              "tables": [
                {
                  language: "sql",
                  name: "tableIntroduction",
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
    const v = new Validator([GRAMMAR_DESCRIPTION]);

    const astDesc: AST.NodeDescription = {
      language: "sql",
      name: "querySelect",
      children: {
        "select": [
          {
            language: "sql",
            name: "select",
            children: {
              "columns": [
                {
                  language: "sql",
                  name: "starOperator"
                }
              ]
            }
          },
        ],
        "from": [
          {
            language: "sql",
            name: "from",
            children: {
              "tables": [
                {
                  language: "sql",
                  name: "tableIntroduction",
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
                        "name": "tableIntroduction",
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
    const v = new Validator([GRAMMAR_DESCRIPTION]);

    const astDesc: AST.NodeDescription = {
      language: "sql",
      name: "querySelect",
      children: {
        "select": [
          {
            language: "sql",
            name: "select",
            children: {
              "columns": [
                {
                  language: "sql",
                  name: "starOperator"
                }
              ]
            }
          },
        ],
        "from": [
          {
            language: "sql",
            name: "from",
            children: {
              "tables": [
                {
                  language: "sql",
                  name: "tableIntroduction",
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
                        "name": "tableIntroduction",
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
        ],
        "where": [
          {
            language: "sql",
            name: "where",
            children: {
              "expressions": [
                {
                  language: "sql",
                  name: "expression",
                  children: {
                    "expression": [
                      {
                        language: "sql",
                        name: "binaryExpression",
                        children: {
                          "operands": [
                            {
                              language: "sql",
                              name: "expression",
                              children: {
                                "expression": [
                                  {
                                    language: "sql",
                                    name: "columnName",
                                    properties: {
                                      "columnName": "id",
                                      "refTableName": "foo"
                                    }
                                  },
                                ]
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
                              name: "expression",
                              children: {
                                "expression": [
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
                }
              ]
            }
          }
        ]
      }
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors).toEqual([]);
  });

  it("Valid: SELECT * FROM foo, bar WHERE foo.id = bar.id AND foo.id = 2", () => {
    const v = new Validator([GRAMMAR_DESCRIPTION]);

    const astDesc: AST.NodeDescription = {
      language: "sql",
      name: "querySelect",
      children: {
        "select": [
          {
            language: "sql",
            name: "select",
            children: {
              "columns": [
                {
                  language: "sql",
                  name: "starOperator"
                }
              ]
            }
          },
        ],
        "from": [
          {
            language: "sql",
            name: "from",
            children: {
              "tables": [
                {
                  language: "sql",
                  name: "tableIntroduction",
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
                        "name": "tableIntroduction",
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
        ],
        "where": [
          {
            language: "sql",
            name: "where",
            children: {
              "expressions": [
                {
                  language: "sql",
                  name: "expression",
                  children: {
                    "expression": [
                      {
                        language: "sql",
                        name: "binaryExpression",
                        children: {
                          "operands": [
                            {
                              language: "sql",
                              name: "expression",
                              children: {
                                "expression": [
                                  {
                                    language: "sql",
                                    name: "columnName",
                                    properties: {
                                      "columnName": "id",
                                      "refTableName": "foo"
                                    }
                                  },
                                ]
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
                              name: "expression",
                              children: {
                                "expression": [
                                  {
                                    language: "sql",
                                    name: "columnName",
                                    properties: {
                                      "columnName": "id",
                                      "refTableName": "bar"
                                    }
                                  },
                                ]
                              }
                            },
                          ]
                        }
                      },
                    ]
                  }
                },
                {
                  language: "sql",
                  name: "whereAdditional",
                  children: {
                    "expression": [
                      {
                        language: "sql",
                        name: "expression",
                        children: {
                          "expression": [
                            {
                              language: "sql",
                              name: "binaryExpression",
                              children: {
                                "operands": [
                                  {
                                    language: "sql",
                                    name: "expression",
                                    children: {
                                      "expression": [
                                        {
                                          language: "sql",
                                          name: "columnName",
                                          properties: {
                                            "columnName": "id",
                                            "refTableName": "foo"
                                          }
                                        },
                                      ]
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
                                    name: "expression",
                                    children: {
                                      "expression": [
                                        {
                                          language: "sql",
                                          name: "constant",
                                          properties: {
                                            "value": "2"
                                          }
                                        }
                                      ]
                                    }
                                  },
                                ]
                              }
                            }
                          ]
                        }
                      },
                    ]
                  },
                  properties: {
                    "operator": "and"
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

    expect(res.errors).toEqual([]);
  });
});
