import { BlockLanguageDescription } from '../block-language.description'

export const BLOCK_LANGUAGE_DESCRIPTION: BlockLanguageDescription = {
  id: "af3a4b65-738c-4563-9632-2c65d3da6762",
  name: "CSS",
  slug: "css",
  defaultProgrammingLanguageId: "css",
  editorComponents: [],
  editorBlocks: [
    {
      describedType: {
        languageName: "css",
        typeName: "document"
      },
      visual: [
        {
          blockType: "block",
          dropTarget: {
            visibility: { $var: "ifLegalChild" }
          },
          children: [
            {
              blockType: "constant",
              text: "/* CSS Dokument */",
              style: {
                color: "#006400"
              }
            },
            {
              blockType: "iterator",
              childGroupName: "rules",
            },
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
          children: [
            {
              blockType: "dropTarget",
              dropTarget: {
                visibility: { $some: [{ $var: "ifEmpty" }, { $var: "ifLegalChild" }] }
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
                },
              ],
            },
            {
              blockType: "iterator",
              childGroupName: "selectors",
            },
            {
              blockType: "constant",
              text: "{",
              style: {
                "marginLeft": "1ch"
              }
            },
          ]
        },
        {
          blockType: "dropTarget",
          dropTarget: {
            visibility: { $some: [{ $var: "ifEmpty" }, { $var: "ifLegalChild" }] }
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
            },
          ]
        },
        {
          blockType: "iterator",
          childGroupName: "declarations",
          style: {
            "marginLeft": "2ch"
          }
        },
        {
          blockType: "constant",
          text: "}",
        },
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
          children: [
            {
              blockType: "input",
              property: "value",
            }
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
          children: [
            {
              blockType: "constant",
              text: "."
            },
            {
              blockType: "input",
              property: "value",
            }
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
          children: [
            {
              blockType: "constant",
              text: "#",
            },
            {
              blockType: "input",
              property: "value",
            }
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
          children: [
            {
              blockType: "dropTarget",
              dropTarget: {
                visibility: { $some: [{ $var: "ifEmpty" }, { $var: "ifLegalChild" }] }
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
                },
              ],
            },
            {
              blockType: "iterator",
              childGroupName: "name",
            },
            {
              blockType: "constant",
              text: ":",
              style: {
                "marginRight": "1ch"
              }
            },
            {
              blockType: "dropTarget",
              dropTarget: {
                visibility: { $some: [{ $var: "ifEmpty" }, { $var: "ifLegalChild" }] }
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
                },
              ],
            },
            {
              blockType: "iterator",
              childGroupName: "value",
            },
            {
              blockType: "constant",
              text: ";"
            },
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
          children: [
            {
              blockType: "input",
              property: "value",
            }
          ]
        }
      ]
    },
    {
      describedType: {
        languageName: "css",
        typeName: "exprAny"
      },
      visual: [
        {
          blockType: "block",
          children: [
            {
              blockType: "input",
              property: "value",
            }
          ]
        }
      ]
    },
    {
      describedType: {
        languageName: "css",
        typeName: "propertyName"
      },
      visual: [
        {
          blockType: "block",
          children: [
            {
              blockType: "input",
              property: "name",
            }
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
            },
            {
              displayName: "<eigenschaft>: <wert>",
              defaultNode: {
                language: "css",
                name: "declaration",
                children: {
                  "name": [],
                  "value": []
                }
              }
            },
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
                name: "propertyName",
                properties: {
                  "name": "backgroundColor"
                }
              }
            },
            {
              displayName: "color",
              defaultNode: {
                language: "css",
                name: "propertyName",
                properties: {
                  "name": "color"
                }
              }
            },
          ]
        },
        {
          categoryCaption: "Werte",
          blocks: [
            {
              displayName: "<beliebiger wert>",
              defaultNode: {
                language: "css",
                name: "exprAny",
                properties: {
                  "value": "any"
                }
              }
            },
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
