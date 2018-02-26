import { BlockLanguageDescription } from '../block-language.description'
import {
  SidebarBlockDescription, EditorBlockDescription, VisualBlockDescriptions
} from '../block.description'

export const LANGUAGE_MODEL: BlockLanguageDescription = {
  id: "regex",
  name: "Reguläre Ausdrücke",
  defaultProgrammingLanguage: "regex",
  sidebars: [
    {
      type: "fixedBlocks",
      caption: "RegEx",
      categories: [
        {
          categoryCaption: "RegEx Group",
          blocks: [
            {
              defaultNode: {
                language: "regex",
                name: "root",
                children: {
                  "expressions": []
                }
              },
              displayName: "Regulärer Ausdruck",
            },
            {
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
              displayName: "Konstante 'a'",
            },
            {
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
              displayName: "Konstante 'b'",
            },
            {
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
              displayName: "Konstante 'c'",
            },
            {
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
              displayName: "Alternative"
            }
          ]
        }
      ]
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
            } as VisualBlockDescriptions.EditorConstant,
            {
              blockType: "iterator",
              childGroupName: "expressions",
              direction: "horizontal",
            } as VisualBlockDescriptions.EditorIterator,
          ]
        } as VisualBlockDescriptions.EditorBlock
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
            } as VisualBlockDescriptions.EditorInterpolated,
          ]
        } as VisualBlockDescriptions.EditorBlock
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
                } as VisualBlockDescriptions.EditorConstant
              ],
            } as VisualBlockDescriptions.EditorDropTarget,
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
                    } as VisualBlockDescriptions.EditorConstant
                  ],
                } as VisualBlockDescriptions.EditorDropTarget,
              ]
            } as VisualBlockDescriptions.EditorIterator,
            {
              blockType: "constant",
              text: ")"
            } as VisualBlockDescriptions.EditorConstant,
          ]
        } as VisualBlockDescriptions.EditorBlock
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
        } as VisualBlockDescriptions.EditorIterator,
      ]
    }
  ]
}
