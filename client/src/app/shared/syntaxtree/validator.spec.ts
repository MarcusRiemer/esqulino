import * as Schema from './validator.description'
import * as AST from './syntaxtree'
import { Validator, ErrorCodes } from './validator'

/**
 * Describes a language where each document would be the equivalent
 * to something like
 * <html>
 *   <head></head>
 *   <body>
 *     <h1>Heading</h1>
 *     <p>Paragraph</p>
 *   </body>
 * </html>
 */
const langMiniHtml: Schema.LanguageDescription = {
  languageName: "mini-html",
  types: {
    "html": {
      childrenCategories: {
        "children": {
          children: {
            type: "sequence",
            nodeTypes: ["head", "body"]
          }
        }
      }
    } as Schema.NodeTypeDescription,
    "head": {},
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
    "paragraph": {},
    "heading": {},
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
        "children": {
          children: {
            type: "sequence",
            nodeTypes: ["select", "from", "where"]
          }
        }
      }
    },
    "query-delete": {
      childrenCategories: {
        "children": {
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

describe('Language Validator', () => {
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

    debugger;

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
          { nodeLanguage: "mini-html", nodeName: "head" },
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
