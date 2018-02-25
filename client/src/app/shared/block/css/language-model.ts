import { BlockLanguageDescription } from '../block-language.description'
import {
  SidebarBlockDescription, EditorBlockDescription, VisualBlockDescriptions
} from '../block.description'

export const BLOCK_LANGUAGE_DESCRIPTION: BlockLanguageDescription = {
  id: "css",
  name: "CSS",
  slug: "css",
  editorBlocks: [
    {
      describedType: {
        languageName: "css",
        typeName: "document"
      },
      visual: [
        {
          blockType: "block",
          direction: "vertical",
          dropTarget: {
            children: {
              category: "rules",
              order: "insertFirst"
            }
          },
          children: [
            {
              blockType: "constant",
              text: "/* CSS Dokument */",
              style: {
                color: "#006400"
              }
            } as VisualBlockDescriptions.EditorConstant,
            {
              blockType: "iterator",
              childGroupName: "rules",
              direction: "vertical",
            } as VisualBlockDescriptions.EditorIterator,
          ]
        },
      ]
    },
    {
      describedType: {
        languageName: "css",
        typeName: "rule"
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          children: [
            {
              blockType: "dropTarget",
              dropTarget: {
                children: {
                  category: "selectors",
                  order: "insertFirst"
                }
              },
              children: [
                {
                  blockType: "constant",
                  text: "❓",
                  style: {
                    "paddingLeft": "10px",
                    "paddingRight": "10px",
                    "border": "2px solid red",
                    "color": "darkred",
                    "backgroundColor": "orange",
                    "borderRadius": "500px",
                    "cursor": "default",
                  },
                } as VisualBlockDescriptions.EditorConstant,
              ],
              direction: "horizontal",
              visibility: ["ifEmpty", "ifLegalChild"]
            },
            {
              blockType: "iterator",
              childGroupName: "selectors",
              direction: "horizontal",
            } as VisualBlockDescriptions.EditorIterator,
            {
              blockType: "constant",
              text: "{",
              style: {
                "marginLeft": "1ch"
              }
            } as VisualBlockDescriptions.EditorConstant,
          ]
        },
        {
          blockType: "dropTarget",
          dropTarget: {
            children: {
              category: "declarations",
              order: "insertFirst"
            }
          },
          children: [
            {
              blockType: "constant",
              text: "❓",
              style: {
                "marginLeft": "2ch",
                "paddingLeft": "10px",
                "paddingRight": "10px",
                "border": "2px solid red",
                "color": "darkred",
                "backgroundColor": "orange",
                "borderRadius": "500px",
                "cursor": "default",
              },
            } as VisualBlockDescriptions.EditorConstant,
          ],
          direction: "horizontal",
          visibility: ["ifEmpty", "ifLegalChild"]
        },
        {
          blockType: "iterator",
          childGroupName: "declarations",
          direction: "vertical",
          style: {
            "marginLeft": "2ch"
          }
        } as VisualBlockDescriptions.EditorIterator,
        {
          blockType: "constant",
          text: "}",
        } as VisualBlockDescriptions.EditorConstant,
      ]
    },
    {
      describedType: {
        languageName: "css",
        typeName: "selectorType"
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          children: [
            {
              blockType: "interpolated",
              property: "value",
            } as VisualBlockDescriptions.EditorInterpolated,
          ]
        }
      ]
    },
    {
      describedType: {
        languageName: "css",
        typeName: "selectorClass"
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          children: [
            {
              blockType: "constant",
              text: "."
            } as VisualBlockDescriptions.EditorConstant,
            {
              blockType: "interpolated",
              property: "value",
            } as VisualBlockDescriptions.EditorInterpolated,
          ]
        }
      ]
    },
    {
      describedType: {
        languageName: "css",
        typeName: "selectorId"
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          children: [
            {
              blockType: "constant",
              text: "#"
            } as VisualBlockDescriptions.EditorConstant,
            {
              blockType: "interpolated",
              property: "value",
            } as VisualBlockDescriptions.EditorInterpolated,
          ]
        }
      ]
    },
    {
      describedType: {
        languageName: "css",
        typeName: "declaration"
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          children: [
            {
              blockType: "interpolated",
              property: "key",
            } as VisualBlockDescriptions.EditorInterpolated,
            {
              blockType: "constant",
              text: ":",
              style: {
                "marginRight": "1ch"
              }
            } as VisualBlockDescriptions.EditorConstant,
            {
              blockType: "interpolated",
              property: "value",
            } as VisualBlockDescriptions.EditorInterpolated,
            {
              blockType: "constant",
              text: ";"
            } as VisualBlockDescriptions.EditorConstant,
          ]
        }
      ]
    },
    {
      describedType: {
        languageName: "css",
        typeName: "backgroundColor"
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          children: [
            {
              blockType: "constant",
              text: "background-color:",
              style: {
                "marginRight": "1ch"
              }
            } as VisualBlockDescriptions.EditorConstant,
            {
              blockType: "dropTarget",
              dropTarget: {
                children: {
                  category: "value",
                  order: "insertFirst"
                }
              },
              children: [
                {
                  blockType: "constant",
                  text: "❓",
                  style: {
                    "paddingLeft": "10px",
                    "paddingRight": "10px",
                    "border": "2px solid red",
                    "color": "darkred",
                    "backgroundColor": "orange",
                    "borderRadius": "500px",
                    "cursor": "default",
                  },
                } as VisualBlockDescriptions.EditorConstant,
              ],
              direction: "horizontal",
              visibility: ["ifEmpty", "ifLegalChild"]
            },
            {
              blockType: "iterator",
              childGroupName: "value",
              direction: "horizontal",
            } as VisualBlockDescriptions.EditorIterator,
            {
              blockType: "constant",
              text: ";"
            } as VisualBlockDescriptions.EditorConstant,
          ]
        }
      ]
    },
    {
      describedType: {
        languageName: "css",
        typeName: "color"
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          children: [
            {
              blockType: "constant",
              text: "color:",
              style: {
                "marginRight": "1ch"
              }
            } as VisualBlockDescriptions.EditorConstant,
            {
              blockType: "dropTarget",
              dropTarget: {
                children: {
                  category: "value",
                  order: "insertFirst"
                }
              },
              children: [
                {
                  blockType: "constant",
                  text: "❓",
                  style: {
                    "paddingLeft": "10px",
                    "paddingRight": "10px",
                    "border": "2px solid red",
                    "color": "darkred",
                    "backgroundColor": "orange",
                    "borderRadius": "500px",
                    "cursor": "default",
                  },
                } as VisualBlockDescriptions.EditorConstant,
              ],
              direction: "horizontal",
              visibility: ["ifEmpty", "ifLegalChild"]
            },
            {
              blockType: "iterator",
              childGroupName: "value",
              direction: "horizontal",
            } as VisualBlockDescriptions.EditorIterator,
            {
              blockType: "constant",
              text: ";"
            } as VisualBlockDescriptions.EditorConstant,
          ]
        }
      ]
    },
    {
      describedType: {
        languageName: "css",
        typeName: "exprColor"
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          children: [
            {
              blockType: "interpolated",
              property: "value",
            } as VisualBlockDescriptions.EditorInterpolated
          ]
        }
      ]
    }
  ],
  sidebars: [
    {
      type: "fixedBlocks",
      caption: "CSS",
      categories: [
        {
          categoryCaption: "Struktur",
          blocks: [
            {
              displayName: "Dokument",
              defaultNode: {
                language: "css",
                name: "document",
                children: {
                  "rules": []
                }
              }
            },
            {
              displayName: "Regel",
              defaultNode: {
                language: "css",
                name: "rule",
                children: {
                  "selectors": [],
                  "declarations": [],
                }
              }
            }
          ]
        },
        {
          categoryCaption: "Selektoren",
          blocks: [
            {
              displayName: "h1",
              defaultNode: {
                language: "css",
                name: "selectorType",
                properties: {
                  "value": "h1"
                }
              }
            },
            {
              displayName: "h2",
              defaultNode: {
                language: "css",
                name: "selectorType",
                properties: {
                  "value": "h2"
                }
              }
            },
          ]
        },
        {
          categoryCaption: "Eigenschaften",
          blocks: [
            {
              displayName: "backgroundColor",
              defaultNode: {
                language: "css",
                name: "backgroundColor",
                children: {
                  "value": []
                }
              }
            },
            {
              displayName: "color",
              defaultNode: {
                language: "css",
                name: "color",
                children: {
                  "value": []
                }
              }
            }
          ]
        },
        {
          categoryCaption: "Werte",
          blocks: [
            {
              displayName: "color: red",
              defaultNode: {
                language: "css",
                name: "exprColor",
                properties: {
                  "value": "red"
                }
              }
            },
            {
              displayName: "color: green",
              defaultNode: {
                language: "css",
                name: "exprColor",
                properties: {
                  "value": "green"
                }
              }
            },
            {
              displayName: "color: blue",
              defaultNode: {
                language: "css",
                name: "exprColor",
                properties: {
                  "value": "blue"
                }
              }
            },
          ]
        }
      ]
    }
  ]
}
