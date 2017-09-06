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
      propertyCategories: {
        "text": {
          base: "string"
        }
      }
    },
    "html": {
      childrenCategories: {
        "children": {
          children: {
            type: "sequence",
            nodeTypes: ["head", "body"]
          }
        }
      }
    },
    "head": {
      childrenCategories: {
        "children": {
          children: {
            type: "allowed",
            nodeTypes: ["text"]
          }
        }
      }
    },
    "body": {
      childrenCategories: {
        "children": {
          children: {
            type: "allowed",
            nodeTypes: ["paragraph", "heading"]
          }
        }
      }
    },
    "paragraph": {
      childrenCategories: {
        "attributes": {
          children: {
            type: "allowed",
            nodeTypes: ["attr-class"]
          }
        },
        "children": {
          children: {
            type: "allowed",
            nodeTypes: ["text"]
          }
        }
      }
    },
    "heading": {
      childrenCategories: {
        "attributes": {
          children: {
            type: "allowed",
            nodeTypes: ["attr-id"]
          }
        },
        "children": {
          children: {
            type: "allowed",
            nodeTypes: ["text"]
          }
        }
      }
    },
    "attr-class": {
      childrenCategories: {
        "classes": {
          children: {
            type: "allowed",
            nodeTypes: ["text"]
          }
        }
      }
    },
    "attr-id": {
      propertyCategories: {
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
      childrenCategories: {
        "components": {
          children: {
            type: "sequence",
            nodeTypes: ["select", "from", "where"]
          }
        }
      }
    },
    "query-delete": {
      childrenCategories: {
        "components": {
          children: {
            type: "sequence",
            nodeTypes: ["delete", "from", "where"]
          }
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
      propertyCategories: {
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

describe('Language Validator', () => {
  it('String Constraints: Valid', () => {
    const v = new Validator([langStringConstraint]);

    const astDesc: AST.NodeDescription = {
      nodeLanguage: "string-constraint",
      nodeName: "root",
      nodeProperties: {
        "len": "1",
        "min": "12",
        "max": "12"
      }
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(0);
  });

  it('String Constraints: Invalid', () => {
    const v = new Validator([langStringConstraint]);

    const astDesc: AST.NodeDescription = {
      nodeLanguage: "string-constraint",
      nodeName: "root",
      nodeProperties: {
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

  it('Mini-HTML: superflous children', () => {
    const v = new Validator([langMiniHtml]);

    const astDesc: AST.NodeDescription = {
      nodeLanguage: "mini-html",
      nodeName: "html",
      nodeChildren: {
        children: [
          { nodeLanguage: "mini-html", nodeName: "head" },
          { nodeLanguage: "mini-html", nodeName: "body" }
        ],
        superflous: [
          { nodeLanguage: "mini-html", nodeName: "mini-html" }
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
      nodeLanguage: "mini-sql",
      nodeName: "query-select"
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
      nodeLanguage: "mini-html",
      nodeName: "html"
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
      nodeLanguage: "mini-html",
      nodeName: "html",
      nodeChildren: {
        children: [
          {
            nodeLanguage: "mini-html",
            nodeName: "head",
            nodeChildren: {
              children: [
                {
                  nodeLanguage: "mini-html",
                  nodeName: "text",
                  nodeProperties: {
                    "text": "Minimal"
                  }
                }
              ]
            }
          },
          { nodeLanguage: "mini-html", nodeName: "body" }
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
      nodeLanguage: "mini-html",
      nodeName: "html",
      nodeChildren: {
        children: [
          { nodeLanguage: "mini-html", nodeName: "head" },
          {
            nodeLanguage: "mini-html",
            nodeName: "body",
            nodeChildren: {
              children: [
                {
                  nodeLanguage: "mini-html",
                  nodeName: "heading"
                },
                {
                  nodeLanguage: "mini-html",
                  nodeName: "paragraph"
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
      nodeLanguage: "mini-html",
      nodeName: "html",
      nodeChildren: {
        children: [
          { nodeLanguage: "mini-html", nodeName: "head" },
          {
            nodeLanguage: "mini-html",
            nodeName: "body",
            nodeChildren: {
              children: [
                {
                  nodeLanguage: "mini-html",
                  nodeName: "html"
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
      nodeLanguage: "mini-html",
      nodeName: "html",
      nodeChildren: {
        children: [
          {
            nodeLanguage: "mini-sql",
            nodeName: "query-select"
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
