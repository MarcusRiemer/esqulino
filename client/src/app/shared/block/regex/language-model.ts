import { BlockLanguageDescription } from '../block-language.description'
import { VisualBlockDescriptions } from '../block.description'

export const BLOCK_LANGUAGE_DESCRIPTION: BlockLanguageDescription = {
  id: "9e529caa-aa86-48eb-9a12-83889377195e",
  slug: "regex",
  name: "Reguläre Ausdrücke",
  defaultProgrammingLanguageId: "regex",
  editorComponents: [],
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
          children: [
            {
              blockType: "dropTarget",
              dropTarget: {
                visibility: { $var: "ifLegalChild" }
              },
              children: [
                {
                  blockType: "constant",
                  text: "("
                }
              ],
            },
            {
              blockType: "iterator",
              childGroupName: "expressions",
              between: [
                {
                  blockType: "dropTarget",
                  dropTarget: {
                    visibility: { $var: "ifLegalChild" }
                  },
                  children: [
                    {
                      blockType: "constant",
                      text: "|"
                    }
                  ],
                },
              ]
            },
            {
              blockType: "constant",
              text: ")"
            },
          ]
        }
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
        },
      ]
    }
  ]
}
