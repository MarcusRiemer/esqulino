import * as Schema from './validator.description'
import * as AST from './syntaxtree'
import { Validator, ErrorCodes } from './validator'

/**
 * Describes a language where each document would be the equivalent
 * to something like
 * <html>
 *   <head></head>
 *   <body>
 *     <h1 id="the-only">Heading</h1>
 *     <p class="foo bar">Paragraph 1</p>
 *     <p class="hello world">Paragraph 2</p>
 *   </body>
 * </html>
 */
const langMiniHtml: Schema.LanguageDescription = {
  languageName: "mini-html",
  types: {
    "text": {
      properties: {
        "text": {
          base: "string"
        }
      }
    },
    "html": {
      children: {
        "children": {
          type: "sequence",
          nodeTypes: ["head", "body"]
        }
      }
    },
    "head": {
      children: {
        "children": {
          type: "allowed",
          nodeTypes: ["text"]
        }
      }
    },
    "body": {
      children: {
        "children": {
          type: "allowed",
          nodeTypes: ["paragraph", "heading"]
        }
      }
    },
    "paragraph": {
      children: {
        "attributes": {
          type: "allowed",
          nodeTypes: ["attr-class"]
        },
        "children": {
          type: "allowed",
          nodeTypes: ["text"]
        }
      }
    },
    "heading": {
      children: {
        "attributes": {
          type: "allowed",
          nodeTypes: ["attr-id"]
        },
        "children": {
          type: "allowed",
          nodeTypes: ["text"]
        }
      }
    },
    "attr-class": {
      children: {
        "classes": {
          type: "allowed",
          nodeTypes: ["text"]
        }
      }
    },
    "attr-id": {
      properties: {
        "id": {
          base: "string"
        }
      }
    }
  },
  root: ["html"]
};

/**
 * Describes a language where each query would be the equivalent
 * to something like
 *
 * SELECT
 * FROM
 * WHERE
 *
 * or
 *
 * DELETE
 * FROM
 * WHERE
 */
const langMiniSql: Schema.LanguageDescription = {
  languageName: "mini-sql",
  types: {
    "select": {},
    "delete": {},
    "from": {},
    "where": {},
    "query-select": {
      children: {
        "components": {
          type: "sequence",
          nodeTypes: ["select", "from", "where"]
        }
      }
    },
    "query-delete": {
      children: {
        "components": {
          type: "sequence",
          nodeTypes: ["delete", "from", "where"]
        }
      }
    }
  },
  root: ["query-select", "query-delete"]
}

/**
 * A single node that uses every possible string constraint.
 */
const langStringConstraint: Schema.LanguageDescription = {
  languageName: "string-constraint",
  types: {
    root: {
      properties: {
        "len": {
          base: "string",
          restrictions: [
            { type: "length", value: 1 }
          ]
        },
        "min": {
          base: "string",
          restrictions: [
            { type: "minLength", value: 2 }
          ]
        },
        "max": {
          base: "string",
          restrictions: [
            { type: "maxLength", value: 2 }
          ]
        }
      }
    }
  },
  root: ["root"]
}

const langSequenceConstraint: Schema.LanguageDescription = {
  languageName: "sequence-constraint",
  types: {
    "root": {
      children: {
        "nodes": {
          type: "sequence",
          nodeTypes: [
            "a",
            {
              nodeType: "b",
              minOccurs: 0,
              maxOccurs: 2,
            },
            "a",
            {
              nodeType: "c",
              minOccurs: 1,
              maxOccurs: 2
            }
          ]
        }
      }
    },
    "a": {},
    "b": {},
    "c": {}
  },
  root: ["root"]
}

/**
 * A single node with only boolean properties.
 */
const langBooleanConstraint: Schema.LanguageDescription = {
  languageName: "boolean-constraint",
  types: {
    "root": {
      properties: {
        "foo": { base: "boolean" }
      }
    }
  },
  root: ["root"]
}

describe('Language Validator', () => {
  it('String Constraints: Valid', () => {
    const v = new Validator([langStringConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "string-constraint",
      name: "root",
      properties: {
        "len": "1",
        "min": "12",
        "max": "12"
      }
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(0);
  });

  it('Boolean Constraint', () => {
    const v = new Validator([langBooleanConstraint]);

    const astDescTrue: AST.NodeDescription = {
      language: "boolean-constraint",
      name: "root",
      properties: {
        "foo": "true"
      }
    };

    const astTrue = new AST.Node(astDescTrue, undefined);
    const resTrue = v.validateFromRoot(astTrue);
    expect(resTrue.isValid).toBeTruthy();

    const astDescFalse: AST.NodeDescription = {
      language: "boolean-constraint",
      name: "root",
      properties: {
        "foo": "false"
      }
    };

    const astFalse = new AST.Node(astDescFalse, undefined);
    const resFalse = v.validateFromRoot(astFalse);
    expect(resFalse.isValid).toBeTruthy();

    const astDescInvalid: AST.NodeDescription = {
      language: "boolean-constraint",
      name: "root",
      properties: {
        "foo": "foo"
      }
    };

    const astInvalid = new AST.Node(astDescInvalid, undefined);
    const resInvalid = v.validateFromRoot(astInvalid);
    expect(resInvalid.errors.length).toEqual(1)
    expect(resInvalid.errors[0].code).toEqual(ErrorCodes.IllegalPropertyType);
  });

  it('Invalid Sequence: Completly Empty', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(3);
    expect(res.errors[0].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[0].data).toEqual({
      expected: {
        languageName: "sequence-constraint",
        typeName: "a"
      },
      index: 0
    });
    expect(res.errors[1].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[1].data).toEqual({
      expected: {
        languageName: "sequence-constraint",
        typeName: "a"
      },
      index: 1
    });
    expect(res.errors[2].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[2].data).toEqual({
      expected: {
        languageName: "sequence-constraint",
        typeName: "c"
      },
      index: 2
    });
  });

  it('Invalid Sequence: Only first required node', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        "nodes": [
          {
            language: "sequence-constraint",
            name: "a"
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(2);
    expect(res.errors[0].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[0].data).toEqual({
      expected: {
        languageName: "sequence-constraint",
        typeName: "a"
      },
      index: 1
    });
    expect(res.errors[1].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[1].data).toEqual({
      expected: {
        languageName: "sequence-constraint",
        typeName: "c"
      },
      index: 2
    });
  });

  it('Invalid Sequence: Only first two required nodes', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        "nodes": [
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "a"
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[0].data).toEqual({
      expected: {
        languageName: "sequence-constraint",
        typeName: "c"
      },
      index: 2
    });
  });

  it('Valid Sequence: Exact three required nodes', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        "nodes": [
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "c"
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(0);
  });

  it('Valid Sequence: Three required nodes + Optional "b"-node', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        "nodes": [
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "b"
          },
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "c"
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(0);
  });

  it('Valid Sequence: Three required nodes + two optional "b"-nodes', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        "nodes": [
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "b"
          },
          {
            language: "sequence-constraint",
            name: "b"
          },
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "c"
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(0);
  });

  it('Invalid Sequence: Three required nodes + three optional "b"-nodes', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        "nodes": [
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "b"
          },
          {
            language: "sequence-constraint",
            name: "b"
          },
          {
            language: "sequence-constraint",
            name: "b"
          },
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "c"
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(2);
  });


  it('String Constraints: Invalid', () => {
    const v = new Validator([langStringConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "string-constraint",
      name: "root",
      properties: {
        "len": "12",
        "min": "1",
        "max": "123"
      }
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(3);
    expect(res.errors[0].code).toEqual(ErrorCodes.IllegalPropertyType)
    expect(res.errors[0].data.condition).toEqual("2 != 1");
    expect(res.errors[1].code).toEqual(ErrorCodes.IllegalPropertyType)
    expect(res.errors[1].data.condition).toEqual("1 < 2");
    expect(res.errors[2].code).toEqual(ErrorCodes.IllegalPropertyType)
    expect(res.errors[2].data.condition).toEqual("3 > 2");
  });


  it('Mini-HTML: registers types', () => {
    const v = new Validator([langMiniHtml]);

    expect(v.isKnownLanguage(langMiniHtml.languageName)).toBeTruthy();
    for (let nodeName in langMiniHtml.types) {
      expect(v.isKnownType(langMiniHtml.languageName, nodeName)).toBeTruthy();
    }
  });

  it('Mini-SQL: registers types', () => {
    const v = new Validator([langMiniSql]);

    expect(v.isKnownLanguage(langMiniSql.languageName)).toBeTruthy();
    for (let nodeName in langMiniSql.types) {
      expect(v.isKnownType(langMiniSql.languageName, nodeName)).toBeTruthy();
    }
  });

  it('Mini-HTML: empty', () => {
    const v = new Validator([langMiniHtml]);
    const res = v.validateFromRoot(undefined);

    expect(res.errors.length).toEqual(1);
  });

  it('Mini-HTML: superflous children', () => {
    const v = new Validator([langMiniHtml]);

    const astDesc: AST.NodeDescription = {
      language: "mini-html",
      name: "html",
      children: {
        children: [
          { language: "mini-html", name: "head" },
          { language: "mini-html", name: "body" }
        ],
        superflous: [
          { language: "mini-html", name: "mini-html" }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.SuperflousChildCategory)
  });

  it('Mini-SQL: Empty SELECT query', () => {
    const v = new Validator([langMiniSql]);

    const astDesc: AST.NodeDescription = {
      language: "mini-sql",
      name: "query-select"
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(3, res);
    expect(res.errors[0].code).toEqual(ErrorCodes.MissingChild)
    expect(res.errors[1].code).toEqual(ErrorCodes.MissingChild)
    expect(res.errors[2].code).toEqual(ErrorCodes.MissingChild)
  });

  it('Mini-HTML: Empty document', () => {
    const v = new Validator([langMiniHtml]);

    const astDesc: AST.NodeDescription = {
      language: "mini-html",
      name: "html"
    }

    const ast = new AST.Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors.length).toEqual(2, res);

    expect(res.errors[0].code).toEqual(ErrorCodes.MissingChild)
    expect(res.errors[1].code).toEqual(ErrorCodes.MissingChild)
  });

  it('Mini-HTML: Minimal document', () => {
    const v = new Validator([langMiniHtml]);

    const astDesc: AST.NodeDescription = {
      language: "mini-html",
      name: "html",
      children: {
        children: [
          {
            language: "mini-html",
            name: "head",
            children: {
              children: [
                {
                  language: "mini-html",
                  name: "text",
                  properties: {
                    "text": "Minimal"
                  }
                }
              ]
            }
          },
          { language: "mini-html", name: "body" }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors.length).toEqual(0, res);
  });

  it('Mini-HTML: Heading and paragraph', () => {
    const v = new Validator([langMiniHtml]);

    const astDesc: AST.NodeDescription = {
      language: "mini-html",
      name: "html",
      children: {
        children: [
          { language: "mini-html", name: "head" },
          {
            language: "mini-html",
            name: "body",
            children: {
              children: [
                {
                  language: "mini-html",
                  name: "heading"
                },
                {
                  language: "mini-html",
                  name: "paragraph"
                }
              ]
            }
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors.length).toEqual(0, res);
  });

  it('Mini-HTML: Invalid body (HTML again)', () => {
    const v = new Validator([langMiniHtml]);

    const astDesc: AST.NodeDescription = {
      language: "mini-html",
      name: "html",
      children: {
        children: [
          { language: "mini-html", name: "head" },
          {
            language: "mini-html",
            name: "body",
            children: {
              children: [
                {
                  language: "mini-html",
                  name: "html"
                }
              ]
            }
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors.length).toEqual(1, res);
    expect(res.errors[0].code).toEqual(ErrorCodes.IllegalChildType);
  });


  it('Mini-HTML: Invalid single child (SQL query)', () => {
    const v = new Validator([langMiniHtml, langMiniSql]);

    const astDesc: AST.NodeDescription = {
      language: "mini-html",
      name: "html",
      children: {
        children: [
          {
            language: "mini-sql",
            name: "query-select"
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.isValid).toBeFalsy();
    expect(res.errors.length).toEqual(2);
    expect(res.errors[0].code).toEqual(ErrorCodes.IllegalChildType);
    expect(res.errors[1].code).toEqual(ErrorCodes.MissingChild);
  });
});
