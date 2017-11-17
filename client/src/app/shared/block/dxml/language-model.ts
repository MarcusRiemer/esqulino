import { LANGUAGE_DESCRIPTION } from '../../syntaxtree/dxml'

import { LanguageModelDescription } from '../language-model.description'
import { BlockDescription } from '../block.description'

export const LANGUAGE_MODEL: LanguageModelDescription = {
  id: "dxml",
  displayName: "Dynamisches XML",
  language: LANGUAGE_DESCRIPTION,
  blocks: [
    {
      describedType: {
        languageName: "dxml",
        typeName: "element"
      },
      defaultNode: {
        language: "dxml",
        name: "element",
        children: {
          "elements": [],
          "attributes": [],
        },
        properties: {
          "name": ""
        }
      },
      sidebar: {
        category: "Dynamisches XML",
        displayName: "Element",
      }
    },
    {
      describedType: {
        languageName: "dxml",
        typeName: "attribute"
      },
      defaultNode: {
        language: "dxml",
        name: "attribute",
        children: {
          "value": [

          ]
        },
        properties: {
          "name": "",
        }
      },
      sidebar: {
        category: "Dynamisches XML",
        displayName: "Attribut",
      }
    },
    {
      describedType: {
        languageName: "dxml",
        typeName: "text"
      },
      defaultNode: {
        language: "dxml",
        name: "text",
        properties: {
          "value": "Neuer Text",
        }
      },
      sidebar: {
        category: "Dynamisches XML",
        displayName: "Text",
      }
    },
    {
      describedType: {
        languageName: "dxml",
        typeName: "interpolate"
      },
      defaultNode: {
        language: "dxml",
        name: "interpolate",
        children: {
          "expr": [
            {
              language: "dxml",
              name: "expr",
              children: {
                "concreteExpr": [

                ]
              }
            }
          ]
        }
      },
      sidebar: {
        category: "Dynamisches XML",
        displayName: "<%= Wert %>",
      }
    },
    {
      describedType: {
        languageName: "dxml",
        typeName: "exprVar"
      },
      defaultNode: {
        language: "dxml",
        name: "exprVar",
        properties: {
          "name": "var_a"
        }
      },
      sidebar: {
        category: "Dynamisches XML",
        displayName: "Variable a",
      }
    },
    {
      describedType: {
        languageName: "dxml",
        typeName: "exprVar"
      },
      defaultNode: {
        language: "dxml",
        name: "exprVar",
        properties: {
          "name": "var_b"
        }
      },
      sidebar: {
        category: "Dynamisches XML",
        displayName: "Variable b",
      }
    },
    {
      describedType: {
        languageName: "dxml",
        typeName: "if"
      },
      defaultNode: {
        language: "dxml",
        name: "if",

      },
      sidebar: {
        category: "Dynamisches XML",
        displayName: "<% if %>",
      }
    },
  ]
}

