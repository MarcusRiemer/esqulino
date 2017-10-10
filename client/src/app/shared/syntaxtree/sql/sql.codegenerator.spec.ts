import { CodeGenerator, NodeConverterRegistration, CodeGeneratorProcess } from '../codegenerator'
import { Node, NodeDescription } from '../syntaxtree'

import { NODE_CONVERTER } from './sql.codegenerator'

describe('Language: SQL (Codegen)', () => {
  it('Constant Number: 1', () => {
    const astDesc: NodeDescription = {
      language: "sql",
      name: "constant",
      properties: {
        "value": "1"
      }
    };

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual("1");
  });

  it(`Constant string: 'asdf'`, () => {
    const astDesc: NodeDescription = {
      language: "sql",
      name: "constant",
      properties: {
        "value": "asdf"
      }
    };

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual("'asdf'");
  });

  it(`Parameter: :foo`, () => {
    const astDesc: NodeDescription = {
      language: "sql",
      name: "parameter",
      properties: {
        "name": "foo"
      }
    };

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual(":foo");
  });

  it(`Star Operator: *`, () => {
    const astDesc: NodeDescription = {
      language: "sql",
      name: "starOperator",
    };

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual("*");
  });

  it(`Binary Expression: 1 + 1`, () => {
    const astDesc: NodeDescription = {
      language: "sql",
      name: "binaryExpression",
      children: {
        "operands": [
          {
            language: "sql",
            name: "constant",
            properties: {
              "value": "1",
            }
          },
          {
            language: "sql",
            name: "relationalOperator",
            properties: {
              "operator": "+",
            }
          },
          {
            language: "sql",
            name: "constant",
            properties: {
              "value": "1",
            }
          }
        ]
      }
    };

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual("1 + 1");
  });

  it(`Binary Expression: :id = foo.id`, () => {
    const astDesc: NodeDescription = {
      language: "sql",
      name: "binaryExpression",
      children: {
        "operands": [
          {
            language: "sql",
            name: "parameter",
            properties: {
              "name": "id",
            }
          },
          {
            language: "sql",
            name: "relationalOperator",
            properties: {
              "operator": "=",
            }
          },
          {
            language: "sql",
            name: "columnName",
            properties: {
              "columnName": "id",
              "refTableName": "foo"
            }
          }
        ]
      }
    };

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual(":id = foo.id");
  });

  it(`SELECT component: SELECT *`, () => {
    const astDesc: NodeDescription = {
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

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual("SELECT *");
  });

  it(`SELECT component: SELECT foo.id`, () => {
    const astDesc: NodeDescription = {
      language: "sql",
      name: "select",
      children: {
        "columns": [
          {
            language: "sql",
            name: "columnName",
            properties: {
              "columnName": "id",
              "refTableName": "foo"
            }
          }
        ]
      }
    }

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual("SELECT foo.id");
  });

  it(`SELECT component: SELECT DISTINCT foo.id`, () => {
    const astDesc: NodeDescription = {
      language: "sql",
      name: "select",
      children: {
        "columns": [
          {
            language: "sql",
            name: "columnName",
            properties: {
              "columnName": "id",
              "refTableName": "foo"
            }
          }
        ]
      },
      properties: {
        "distinct": "true"
      }
    }

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual("SELECT DISTINCT foo.id");
  });

  it(`SELECT component: SELECT *, foo.id`, () => {
    const astDesc: NodeDescription = {
      language: "sql",
      name: "select",
      children: {
        "columns": [
          {
            language: "sql",
            name: "starOperator"
          },
          {
            language: "sql",
            name: "columnName",
            properties: {
              "columnName": "id",
              "refTableName": "foo"
            }
          }
        ]
      }
    }

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual("SELECT *, foo.id");
  });

  it(`Table Introduction: foo`, () => {
    const astDesc: NodeDescription = {
      language: "sql",
      name: "tableIntroduction",
      properties: {
        "name": "foo"
      }
    };

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual("foo");
  });

  it(`Table Introduction: foo f`, () => {
    const astDesc: NodeDescription = {
      language: "sql",
      name: "tableIntroduction",
      properties: {
        "name": "foo",
        "alias": "f"
      }
    };

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual("foo f");
  });

  it(`Cross JOIN: JOIN foo`, () => {
    const astDesc: NodeDescription = {
      language: "sql",
      name: "crossJoin",
      children: {
        "table": [
          {
            language: "sql",
            name: "tableIntroduction",
            properties: {
              "name": "foo",
              "alias": "f"
            }
          }
        ]
      }
    };

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual("JOIN foo f");
  });

  it(`FROM component: FROM foo`, () => {
    const astDesc = {
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

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual("FROM foo");
  });

  it(`FROM component: FROM foo JOIN bar`, () => {
    const astDesc = {
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
          }, {
            language: "sql",
            name: "crossJoin",
            children: {
              "table": [
                {
                  language: "sql",
                  name: "tableIntroduction",
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

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual("FROM foo\n\tJOIN bar");
  });

  it(`WHERE additional: AND 1`, () => {
    const astDesc: NodeDescription = {
      language: "sql",
      name: "whereAdditional",
      children: {
        "expression": [
          {
            language: "sql",
            name: "constant",
            properties: {
              "value": 1
            }
          }
        ]
      },
      properties: {
        "operator": "and"
      }
    };

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual("AND 1");
  });

  it(`WHERE additional: OR 1`, () => {
    const astDesc: NodeDescription = {
      language: "sql",
      name: "whereAdditional",
      children: {
        "expression": [
          {
            language: "sql",
            name: "constant",
            properties: {
              "value": 1
            }
          }
        ]
      },
      properties: {
        "operator": "or"
      }
    };

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual("OR 1");
  });

  it(`WHERE component: WHERE 1`, () => {
    const astDesc: NodeDescription = {
      language: "sql",
      name: "where",
      children: {
        "expressions": [
          {
            language: "sql",
            name: "constant",
            properties: {
              "value": 1
            }
          }
        ]
      }
    };

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual("WHERE 1");
  });

  it(`WHERE component: WHERE 1 AND 1`, () => {
    const astDesc: NodeDescription = {
      language: "sql",
      name: "where",
      children: {
        "expressions": [
          {
            language: "sql",
            name: "constant",
            properties: {
              "value": 1
            }
          },
          {
            language: "sql",
            name: "whereAdditional",
            children: {
              "expression": [
                {
                  language: "sql",
                  name: "constant",
                  properties: {
                    "value": 1
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
    };

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual("WHERE 1\n\tAND 1");
  });

  it(`WHERE component: WHERE 1 AND 1 OR 1`, () => {
    const astDesc: NodeDescription = {
      language: "sql",
      name: "where",
      children: {
        "expressions": [
          {
            language: "sql",
            name: "constant",
            properties: {
              "value": 1
            }
          },
          {
            language: "sql",
            name: "whereAdditional",
            children: {
              "expression": [
                {
                  language: "sql",
                  name: "constant",
                  properties: {
                    "value": 1
                  }
                }
              ]
            },
            properties: {
              "operator": "and"
            }
          },
          {
            language: "sql",
            name: "whereAdditional",
            children: {
              "expression": [
                {
                  language: "sql",
                  name: "constant",
                  properties: {
                    "value": 1
                  }
                }
              ]
            },
            properties: {
              "operator": "or"
            }
          }
        ]
      }
    };

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual("WHERE 1\n\tAND 1\n\tOR 1");
  });

  it(`SELECT query: SELECT foo.id FROM foo`, () => {
    const astDesc: NodeDescription = {
      language: "sql",
      name: "querySelect",
      children: {
        "components": [
          {
            language: "sql",
            name: "select",
            children: {
              "columns": [
                {
                  language: "sql",
                  name: "columnName",
                  properties: {
                    "columnName": "id",
                    "refTableName": "foo"
                  }
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

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    expect(result).toEqual("SELECT foo.id\nFROM foo");
  });
});
