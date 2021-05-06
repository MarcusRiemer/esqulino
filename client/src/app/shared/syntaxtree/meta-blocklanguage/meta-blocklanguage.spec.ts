import { NodeDescription } from "../syntaxtree.description";
import { readFromNode } from "./meta-blocklanguage";

describe(`MetaBlockLanguage`, () => {
  describe(`readFromNode`, () => {
    it(`Two root CSS classes`, () => {
      const classes = ["activate-keyword", "activate-block-outline"];

      const doc: NodeDescription = {
        name: "Document",
        language: "MetaBlockLang",
        children: {
          RootCssClasses: classes.map((c) => ({
            name: "CssClass",
            language: "MetaBlockLang",
            properties: {
              Name: c,
            },
          })),
        },
      };

      const meta = readFromNode(doc);
      expect(meta.rootCssClasses).toEqual(classes);
    });
  });
});
