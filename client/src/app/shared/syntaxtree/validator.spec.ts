import * as Schema from './validator.description'
import { Validator } from './validator'

/**
 * Basically describes a language where each document needs to be
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

const langMiniSql: Schema.LanguageDescription = {
  languageName: "mini-sql",
  types: [
    {
      nodeName: "select",
      type: "complex"
    },
    {
      nodeName: "delete",
      type: "complex"
    },
    {
      nodeName: "from",
      type: "complex"
    },
    {
      nodeName: "where",
      type: "complex"
    },
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

describe('Schema Validator', () => {
  it('registers types in a single language', () => {
    const v = new Validator([langMiniHtml]);

    expect(v.isKnownLanguage(langMiniHtml.languageName)).toBeTruthy();
    expect(v.isKnownType(langMiniHtml.languageName, langMiniHtml.types[0].nodeName)).toBeTruthy();
    expect(v.isKnownType(langMiniHtml.languageName, langMiniHtml.types[1].nodeName)).toBeTruthy();
    expect(v.isKnownType(langMiniHtml.languageName, langMiniHtml.types[2].nodeName)).toBeTruthy();
  });
});
