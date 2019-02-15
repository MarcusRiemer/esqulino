import * as AST from '../syntaxtree';
import * as Schema from './grammar.description';
import { Validator } from './validator';
import { ErrorCodes } from './validation-result';

/**
 * This grammar is close to the "real" grammar used for SQL (which is stored
 * somewhere on the server) and is not used during normal execution. But because
 * it is a rather complex grammar, it lends itself very well for testing.
 */
export const GRAMMAR_SQL_DESCRIPTION: Schema.GrammarDescription = {
  id: "7ec93f8a-5a01-4d4d-90b4-27c3f0ae4700",
  name: "sql",
  technicalName: "sql",
  programmingLanguageId: "sql",
  types: {
    "expression": {
      type: "oneOf",
      oneOf: [
        "columnName",
        "binaryExpression",
        "constant",
        "parameter",
        "functionCall"
      ]
    },
    "columnName": {
      type: "concrete",
      attributes: [
        {
          type: "property",
          name: "refTableName",
          base: "string"
        },
        {
          type: "terminal",
          name: "dot",
          symbol: "."
        },
        {
          type: "property",
          name: "columnName",
          base: "string"
        },
      ]
    },
    "constant": {
      type: "concrete",
      attributes: [
        {
          type: "property",
          name: "value",
          base: "string"
        }
      ]
    },
    "parameter": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          name: "colon",
          symbol: ":"
        },
        {
          type: "property",
          name: "name",
          base: "string"
        }
      ]
    },
    "functionCall": {
      type: "concrete",
      attributes: [
        {
          type: "property",
          name: "name",
          base: "string"
        },
        {
          type: "terminal",
          name: "paren-open",
          symbol: "("
        },
        {
          type: "sequence",
          name: "arguments",
          nodeTypes: [
            {
              nodeType: "expression",
              occurs: "*"
            }
          ],
          between: {
            type: "terminal",
            name: "param-separator",
            symbol: ","
          }
        },
        {
          type: "terminal",
          name: "paren-close",
          symbol: ")"
        }
      ]
    },
    "starOperator": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          name: "star",
          symbol: "*"
        }
      ]
    },
    "relationalOperator": {
      type: "concrete",
      attributes: [
        {
          type: "property",
          name: "operator",
          base: "string",
          restrictions: [
            {
              type: "enum",
              value: ["<", "<=", "=", ">=", ">", "LIKE", "NOT LIKE"]
            }
          ]
        }
      ]
    },
    "binaryExpression": {
      type: "concrete",
      attributes: [
        {
          type: "sequence",
          name: "lhs",
          nodeTypes: [
            "expression"
          ]
        },
        {
          type: "sequence",
          name: "operator",
          nodeTypes: [
            "relationalOperator"
          ]
        }, {
          type: "sequence",
          name: "rhs",
          nodeTypes: [
            "expression"
          ]
        }
      ]
    },
    "select": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          name: "keyword",
          symbol: "SELECT"
        },
        {
          type: "property",
          name: "distinct",
          base: "boolean",
          isOptional: true
        },
        {
          type: "allowed",
          name: "columns",
          nodeTypes: [
            {
              nodeType: "expression",
              occurs: "*"
            },
            {
              nodeType: "starOperator",
              occurs: "?"
            }
          ],
          between: {
            type: "terminal",
            name: "columnSeparator",
            symbol: ","
          }
        }
      ]
    },
    "delete": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          name: "keyword",
          symbol: "DELETE"
        },
      ]
    },
    "tableIntroduction": {
      type: "concrete",
      attributes: [
        {
          type: "property",
          name: "name",
          base: "string"
        },
        {
          type: "property",
          name: "alias",
          base: "string",
          isOptional: true
        }
      ]
    },
    "crossJoin": {
      type: "concrete",
      attributes: [
        {
          type: "sequence",
          name: "table",
          nodeTypes: ["tableIntroduction"]
        }
      ]
    },
    "innerJoinOn": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          name: "keyword",
          symbol: "INNER JOIN"
        },
        {
          type: "sequence",
          name: "table",
          nodeTypes: ["tableIntroduction"]
        },
        {
          type: "terminal",
          name: "keywordOn",
          symbol: "ON"
        },
        {
          type: "sequence",
          name: "on",
          nodeTypes: ["expression"]
        }
      ]
    },
    "innerJoinUsing": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          name: "keyword",
          symbol: "INNER JOIN"
        },
        {
          type: "sequence",
          name: "table",
          nodeTypes: ["tableIntroduction"]
        },
        {
          type: "terminal",
          name: "keywordUsing",
          symbol: "USING"
        },
        {
          type: "sequence",
          name: "using",
          nodeTypes: ["expression"]
        }
      ]
    },
    "join": {
      type: "oneOf",
      oneOf: ["crossJoin", "innerJoinUsing", "innerJoinOn"]
    },
    "from": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          name: "keyword",
          symbol: "FROM"
        },
        {
          type: "sequence",
          name: "tables",
          nodeTypes: [
            {
              nodeType: "tableIntroduction",
              occurs: "+"
            }
          ],
          between: {
            type: "terminal",
            name: "columnSeparator",
            symbol: ","
          }
        },
        {
          type: "sequence",
          name: "joins",
          nodeTypes: [
            {
              nodeType: "join",
              occurs: "*"
            }
          ]
        }
      ]
    },
    "whereAdditional": {
      type: "concrete",
      attributes: [
        {
          type: "property",
          name: "operator",
          base: "string",
          restrictions: [
            { type: "enum", value: ["and", "or"] }
          ]
        },
        {
          type: "sequence",
          name: "expression",
          nodeTypes: ["expression"]
        }
      ]
    },
    "where": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          symbol: "WHERE",
          name: "keyword",
        },
        {
          type: "sequence",
          name: "expressions",
          nodeTypes: [
            {
              nodeType: {
                languageName: "sql",
                typeName: "expression"
              },
              occurs: "1"
            },
            {
              nodeType: {
                languageName: "sql",
                typeName: "whereAdditional"
              },
              occurs: "*"
            }
          ]
        }
      ]
    },
    "groupBy": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          name: "keyword",
          symbol: "GROUP BY"
        },
        {
          type: "allowed",
          name: "expressions",
          nodeTypes: [
            {
              nodeType: {
                languageName: "sql",
                typeName: "expression"
              },
              occurs: "+"
            },
          ],
          between: {
            type: "terminal",
            name: "columnSeparator",
            symbol: ","
          }
        }
      ]
    },
    "orderBy": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          name: "keyword",
          symbol: "ORDER BY"
        },
        {
          type: "allowed",
          name: "expressions",
          nodeTypes: [
            {
              nodeType: {
                languageName: "sql",
                typeName: "expression"
              },
              occurs: "+"
            },
          ],
          between: {
            type: "terminal",
            name: "columnSeparator",
            symbol: ","
          }
        }
      ]
    },
    "querySelect": {
      type: "concrete",
      attributes: [
        {
          type: "sequence",
          name: "select",
          nodeTypes: [
            "select",
          ]
        },
        {
          type: "sequence",
          name: "from",
          nodeTypes: [
            "from",
          ]
        },
        {
          type: "sequence",
          name: "where",
          nodeTypes: [
            {
              nodeType: "where",
              occurs: "?"
            },
          ]
        },
        {
          type: "sequence",
          name: "groupBy",
          nodeTypes: [
            {
              nodeType: "groupBy",
              occurs: "?"
            },
          ]
        },
        {
          type: "sequence",
          name: "orderBy",
          nodeTypes: [
            {
              nodeType: "orderBy",
              occurs: "?"
            },
          ]
        },
      ]
    },
    "queryDelete": {
      type: "concrete",
      attributes: [
        {
          type: "sequence",
          name: "delete",
          nodeTypes: [
            "delete",
          ]
        },
        {
          type: "sequence",
          name: "from",
          nodeTypes: [
            "from",
          ]
        },
        {
          type: "sequence",
          name: "where",
          nodeTypes: [
            {
              nodeType: "where",
              occurs: "?"
            },
          ]
        }
      ]
    },
    "query": {
      type: "oneOf",
      oneOf: ["querySelect", "queryDelete"]
    },
  },
  root: "query"
}



describe("Language: SQL (Validation)", () => {
  it("Invalid: Empty SELECT-query", () => {
    const v = new Validator([GRAMMAR_SQL_DESCRIPTION]);

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
    const v = new Validator([GRAMMAR_SQL_DESCRIPTION]);

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
    const v = new Validator([GRAMMAR_SQL_DESCRIPTION]);

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
              ],
              "joins": [
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
    const v = new Validator([GRAMMAR_SQL_DESCRIPTION]);

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
              ],
              "joins": [
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
                  name: "binaryExpression",
                  children: {
                    "lhs": [
                      {
                        language: "sql",
                        name: "columnName",
                        properties: {
                          "columnName": "id",
                          "refTableName": "foo"
                        }
                      },
                    ],
                    "operator": [
                      {
                        language: "sql",
                        name: "relationalOperator",
                        properties: {
                          "operator": "="
                        }
                      },
                    ],
                    "rhs": [
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

    expect(res.errors).toEqual([]);
  });

  it("Valid: SELECT * FROM foo, bar WHERE foo.id = bar.id AND foo.id = 2", () => {
    const v = new Validator([GRAMMAR_SQL_DESCRIPTION]);

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
              ],
              "joins": [
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
                  name: "binaryExpression",
                  children: {
                    "lhs": [
                      {
                        language: "sql",
                        name: "columnName",
                        properties: {
                          "columnName": "id",
                          "refTableName": "foo"
                        }
                      },
                    ],
                    "operator": [
                      {
                        language: "sql",
                        name: "relationalOperator",
                        properties: {
                          "operator": "="
                        }
                      },
                    ],
                    "rhs": [
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
                },
                {
                  language: "sql",
                  name: "whereAdditional",
                  children: {
                    "expression": [
                      {
                        language: "sql",
                        name: "binaryExpression",
                        children: {
                          "lhs": [
                            {
                              language: "sql",
                              name: "columnName",
                              properties: {
                                "columnName": "id",
                                "refTableName": "foo"
                              }
                            },
                          ],
                          "operator": [
                            {
                              language: "sql",
                              name: "relationalOperator",
                              properties: {
                                "operator": "="
                              }
                            },
                          ],
                          "rhs": [
                            {
                              language: "sql",
                              name: "constant",
                              properties: {
                                "value": "2",
                              }
                            }
                          ]
                        }
                      }
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
