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
          "name": "e1"
        }
      },
      sidebar: {
        category: "Dynamisches XML",
        displayName: "Element: e1",
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
          "name": "e2"
        }
      },
      sidebar: {
        category: "Dynamisches XML",
        displayName: "Element: e2",
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
          "name": "a1",
        }
      },
      sidebar: {
        category: "Dynamisches XML",
        displayName: "Attribut: a1",
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
          "name": "a2",
        }
      },
      sidebar: {
        category: "Dynamisches XML",
        displayName: "Attribut: a2",
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
          direction: "horizontal",
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
              blockType: "dropTarget",
              dropTarget: {
                childGroupName: "attributes"
              },
              children: [
                {
                  blockType: "constant",
                  text: "+Attribute"
                } as EditorBlockDescriptions.EditorConstant,
              ],
              direction: "horizontal",
              marginLeft: "10px",
              visibility: ["ifEmpty", "ifLegalDrag"]
            } as EditorBlockDescriptions.EditorDropTarget,
            {
              blockType: "iterator",
              childGroupName: "attributes",
              direction: "horizontal",
            } as EditorBlockDescriptions.EditorIterator,
            {
              blockType: "constant",
              text: ">"
            } as EditorBlockDescriptions.EditorConstant,
            {
              blockType: "dropTarget",
              dropTarget: {
                childGroupName: "elements"
              },
              children: [
                {
                  blockType: "constant",
                  text: "+Element"
                } as EditorBlockDescriptions.EditorConstant,
              ],
              direction: "horizontal",
              marginLeft: "10px",
              visibility: ["ifLegalDrag"]
            } as EditorBlockDescriptions.EditorDropTarget,
          ]
        } as EditorBlockDescriptions.EditorBlock,
        {
          blockType: "iterator",
          childGroupName: "elements",
          direction: "vertical",
          marginLeft: "10px",
        } as EditorBlockDescriptions.EditorIterator,
        {
          blockType: "block",
          direction: "horizontal",
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
          direction: "horizontal",
          marginLeft: "10px",
          children: [
            {
              blockType: "interpolated",
              property: "name"
            } as EditorBlockDescriptions.EditorInterpolation,
            {
              blockType: "constant",
              text: "="
            } as EditorBlockDescriptions.EditorConstant,
            {
              blockType: "constant",
              text: "\""
            } as EditorBlockDescriptions.EditorConstant,
            {
              blockType: "iterator",
              childGroupName: "value",
              direction: "horizontal",
            } as EditorBlockDescriptions.EditorIterator,
            {
              blockType: "constant",
              text: "\""
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
          direction: "horizontal",
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

