import { LANGUAGE_DESCRIPTION } from '../../syntaxtree/dxml'

import { LanguageModelDescription } from '../language-model.description'
import {
  SidebarBlockDescription, EditorBlockDescription, EditorBlockDescriptions
} from '../block.description'

export const LANGUAGE_MODEL: LanguageModelDescription = {
  id: "dxml",
  displayName: "Dynamisches XML",
  language: LANGUAGE_DESCRIPTION,
  sidebarBlocks: [
    {
      describedType: {
        languageName: "dxml",
        typeName: "element"
      },
      defaultNode: {
        language: "dxml",
        name: "element",
        children: {
          "elements": [
            {
              language: "dxml",
              name: "text",
              properties: {
                "value": "before ..."
              }
            },
            {
              language: "dxml",
              name: "element",
              children: {},
              properties: {
                "name": "child"
              }
            },
            {
              language: "dxml",
              name: "text",
              properties: {
                "value": "after ..."
              }
            },
          ],
          "attributes": [
            {
              language: "dxml",
              name: "attribute",
              children: {
                "value": []
              },
              properties: {
                "name": "att1"
              }
            }
          ],
        },
        properties: {
          "name": "parent"
        }
      },
      sidebar: {
        category: "Dynamisches XML",
        displayName: "Element: ~~Complex~~",
      },
    },
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
          "name": "foo"
        }
      },
      sidebar: {
        category: "Dynamisches XML",
        displayName: "Element: foo",
      },
    },
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
          "name": "bar"
        }
      },
      sidebar: {
        category: "Dynamisches XML",
        displayName: "Element: bar",
      },
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
        children: {
          "condition": [
            {
              language: "dxml",
              name: "expr",
              children: {
                "concreteExpr": []
              }
            }
          ],
          "body": []
        },
      },
      sidebar: {
        category: "Dynamisches XML",
        displayName: "<% if %>",
      }
    },
  ],
  editorBlocks: [
    {
      describedType: {
        languageName: "dxml",
        typeName: "element"
      },
      visual: [
        {
          blockType: "block",
          children: [
            {
              blockType: "constant",
              text: "<"
            } as EditorBlockDescriptions.EditorConstant,
            {
              blockType: "interpolated",
              property: "name"
            } as EditorBlockDescriptions.EditorInterpolation,
            {
              blockType: "iterator",
              childGroupName: "attributes",
            } as EditorBlockDescriptions.EditorIterator,
            {
              blockType: "constant",
              text: ">"
            } as EditorBlockDescriptions.EditorConstant,
          ]
        } as EditorBlockDescriptions.EditorBlock,
        {
          blockType: "iterator",
          childGroupName: "elements",
        } as EditorBlockDescriptions.EditorIterator,
        {
          blockType: "block",
          children: [
            {
              blockType: "constant",
              text: "</"
            } as EditorBlockDescriptions.EditorConstant,
            {
              blockType: "interpolated",
              property: "name"
            } as EditorBlockDescriptions.EditorInterpolation,
            {
              blockType: "constant",
              text: ">"
            } as EditorBlockDescriptions.EditorConstant,

          ]
        } as EditorBlockDescriptions.EditorBlock
      ]
    },
    {
      describedType: {
        languageName: "dxml",
        typeName: "attribute",
      },
      visual: [
        {
          blockType: "block",
          children: [
            {
              blockType: "interpolated",
              property: "name"
            } as EditorBlockDescriptions.EditorInterpolation,
            {
              blockType: "constant",
              text: "=\"--missing--\""
            } as EditorBlockDescriptions.EditorConstant,
          ]
        } as EditorBlockDescriptions.EditorBlock
      ]
    },
    {
      describedType: {
        languageName: "dxml",
        typeName: "text",
      },
      visual: [
        {
          blockType: "block",
          children: [
            {
              blockType: "interpolated",
              property: "value"
            } as EditorBlockDescriptions.EditorInterpolation,
          ]
        } as EditorBlockDescriptions.EditorBlock
      ]
    }
  ]
}

