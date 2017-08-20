import * as Schema from './validator.description'

describe('Schema Validator', () => {
  it('describes a very basic HTML variant', () => {
    const schemaDesc: Schema.SchemaDescription = {
      languageName: "mini-html",
      types: [
        {
          nodeName: "html",
          type: "complex",
          chidlrenCategories: [
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
      root: "html"
    }
  });
});
