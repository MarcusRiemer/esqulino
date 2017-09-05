import * as Schema from './validator.description'
import * as AST from './syntaxtree'
import { Validator, ErrorCodes } from './validator'

/**
 * Describes a language where each document would be the equivalent
 * to something like
 * <html>
 *   <head></head>
 *   <body></body>
 * </html>
 */
const langMiniHtml: Schema.LanguageDescription = {
  languageName: "mini-html",
  types: [
    {
      nodeName: "html",
      type: "complex",
      childrenCategories: [
        {
          categoryName: "children",
          children: {
            type: "sequence",
            nodeTypes: ["head", "body"]
          }
        }
      ]
    } as Schema.NodeComplexTypeDescription,
    {
      nodeName: "head",
      type: "complex",
    } as Schema.NodeComplexTypeDescription,
    {
      nodeName: "body",
      type: "complex",
    } as Schema.NodeComplexTypeDescription
  ],
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
  types: [
    {
      nodeName: "select",
      type: "complex"
    } as Schema.NodeComplexTypeDescription,
    {
      nodeName: "delete",
      type: "complex"
    } as Schema.NodeComplexTypeDescription,
    {
      nodeName: "from",
      type: "complex"
    } as Schema.NodeComplexTypeDescription,
    {
      nodeName: "where",
      type: "complex"
    } as Schema.NodeComplexTypeDescription,
    {
      nodeName: "query-select",
      type: "complex",
      childrenCategories: [
        {
          categoryName: "children",
          children: {
            type: "sequence",
            nodeTypes: ["select", "from", "where"]
          }
        }
      ]
    } as Schema.NodeComplexTypeDescription,
    {
      nodeName: "query-delete",
      type: "complex",
      childrenCategories: [
        {
          categoryName: "children",
          children: {
            type: "sequence",
            nodeTypes: ["delete", "from", "where"]
          }
        }
      ]
    } as Schema.NodeComplexTypeDescription,
  ],
  root: ["query-select", "query-delete"]
}

describe('Language Validator', () => {
  it('Mini-HTML: registers types', () => {
    const v = new Validator([langMiniHtml]);

    expect(v.isKnownLanguage(langMiniHtml.languageName)).toBeTruthy();
    for (let i = 0; i < langMiniHtml.types.length; ++i) {
      expect(v.isKnownType(langMiniHtml.languageName, langMiniHtml.types[i].nodeName)).toBeTruthy();
    }
  });

  it('Mini-SQL: registers types', () => {
    const v = new Validator([langMiniSql]);

    expect(v.isKnownLanguage(langMiniSql.languageName)).toBeTruthy();
    for (let i = 0; i < langMiniSql.types.length; ++i) {
      expect(v.isKnownType(langMiniSql.languageName, langMiniSql.types[i].nodeName)).toBeTruthy();
    }
  });

  it('Mini-HTML: superflous children', () => {
    const v = new Validator([langMiniHtml]);

    const astDesc: AST.NodeDescription = {
      nodeLanguage: "mini-html",
      nodeName: "html",
      nodeChildren: {
        children: [
          {
            nodeLanguage: "mini-html",
            nodeName: "head"
          },
          {
            nodeLanguage: "mini-html",
            nodeName: "body"
          }
        ],
        superflous: [
          {
            nodeLanguage: "mini-html",
            nodeName: "mini-html"
          }
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


  /*
  it('Mini-HTML: Invalid child (SQL query)', () => {
    const v = new Validator([langMiniHtml, langMiniSql]);

    const astDesc: AST.NodeDescription = {
      nodeFamily: "mini-html",
      nodeName: "html",
      nodeChildren: {
        "children": [
          {
            nodeFamily: "mini-sql",
            nodeName: "query-select"
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.isValid).toBeFalsy();
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.UnexpectedType);
    });*/
});
