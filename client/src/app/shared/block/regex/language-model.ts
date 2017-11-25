import { LANGUAGE_DESCRIPTION } from '../../syntaxtree/regex'

import { LanguageModelDescription } from '../language-model.description'
import {
  SidebarBlockDescription, EditorBlockDescription, EditorBlockDescriptions
} from '../block.description'

export const LANGUAGE_MODEL: LanguageModelDescription = {
  id: "regex",
  displayName: "Reguläre Ausdrücke",
  language: LANGUAGE_DESCRIPTION,
  sidebarBlocks: [
    {
      describedType: {
        languageName: "regex",
        typeName: "root"
      },
      defaultNode: {
        language: "regex",
        name: "root",
        children: {
          "expressions": []
        }
      },
      sidebar: {
        category: "Regulärer Ausdruck",
        displayName: "Regulärer Ausdruck",
      },
    },
    {
      describedType: {
        languageName: "regex",
        typeName: "constant"
      },
      defaultNode: {
        language: "regex",
        name: "expr",
        children: {
          "singleExpression": [
            {
              language: "regex",
              name: "constant",
              properties: {
                value: "a"
              }
            }
          ]
        }
      },
      sidebar: {
        category: "Regulärer Ausdruck",
        displayName: "Konstante 'a'",
      }
    },
    {
      describedType: {
        languageName: "regex",
        typeName: "constant"
      },
      defaultNode: {
        language: "regex",
        name: "expr",
        children: {
          "singleExpression": [
            {
              language: "regex",
              name: "constant",
              properties: {
                value: "b"
              }
            }
          ]
        }
      },
      sidebar: {
        category: "Regulärer Ausdruck",
        displayName: "Konstante 'b'",
      }
    },
    {
      describedType: {
        languageName: "regex",
        typeName: "constant"
      },
      defaultNode: {
        language: "regex",
        name: "expr",
        children: {
          "singleExpression": [
            {
              language: "regex",
              name: "constant",
              properties: {
                value: "c"
              }
            }
          ]
        }
      },
      sidebar: {
        category: "Regulärer Ausdruck",
        displayName: "Konstante 'c'",
      }
    },
    {
      describedType: {
        languageName: "regex",
        typeName: "alternative"
      },
      defaultNode: {
        language: "regex",
        name: "expr",
        children: {
          "singleExpression": [
            {
              language: "regex",
              name: "alternative",
              children: {
                "expressions": [
                  {
                    language: "regex",
                    name: "expr",
                  },
                  {
                    language: "regex",
                    name: "expr",
                  }
                ]
              }
            }
          ]
        }
      },
      sidebar: {
        category: "Regulärer Ausdruck",
        displayName: "Alternative"
      }
    }
  ],
  editorBlocks: [
    {
      describedType: {
        languageName: "regex",
        typeName: "root"
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          children: [
            {
              blockType: "constant",
              text: "RegEx: "
            } as EditorBlockDescriptions.EditorConstant,
            {
              blockType: "iterator",
              childGroupName: "expressions",
              direction: "horizontal",
            } as EditorBlockDescriptions.EditorIterator,
          ]
        } as EditorBlockDescriptions.EditorBlock
      ]
    },
    {
      describedType: {
        languageName: "regex",
        typeName: "constant"
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
    },
    {
      describedType: {
        languageName: "regex",
        typeName: "alternative"
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          children: [
            {
              blockType: "dropTarget",
              visibility: ["always"],
              direction: "horizontal",
              dropTarget: {
                actionSelf: {
                  order: "insertAfter",
                  skipParents: 1
                }
              },
              children: [
                {
                  blockType: "constant",
                  text: "("
                } as EditorBlockDescriptions.EditorConstant
              ],
            } as EditorBlockDescriptions.EditorDropTarget,
            {
              blockType: "iterator",
              childGroupName: "expressions",
              direction: "horizontal",
              between: [
                {
                  blockType: "dropTarget",
                  visibility: ["always"],
                  direction: "horizontal",
                  dropTarget: {
                    actionSelf: {
                      order: "insertAfter",
                      skipParents: 1
                    }
                  },
                  children: [
                    {
                      blockType: "constant",
                      text: "|"
                    } as EditorBlockDescriptions.EditorConstant
                  ],
                } as EditorBlockDescriptions.EditorDropTarget,
              ]
            } as EditorBlockDescriptions.EditorIterator,
            {
              blockType: "constant",
              text: ")"
            } as EditorBlockDescriptions.EditorConstant,
          ]
        } as EditorBlockDescriptions.EditorBlock
      ]
    },
    {
      describedType: {
        languageName: "regex",
        typeName: "expr"
      },
      visual: [
        {
          blockType: "iterator",
          childGroupName: "singleExpression",
          direction: "horizontal",
        } as EditorBlockDescriptions.EditorIterator,
      ]
    }
  ]
}
