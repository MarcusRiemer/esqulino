import { BlockLanguageDescription } from '../block-language.description'
import {
  SidebarBlockDescription, EditorBlockDescription, VisualBlockDescriptions
} from '../block.description'

const SIDEBAR_BLOCKS_BASIC: SidebarBlockDescription[] = [
  {
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
    displayName: "Element: ~~Complex~~",
  },
  {
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
    displayName: "Element: e1",
  },
  {
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
    displayName: "Element: e2",
  },
  {
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
    displayName: "Attribut: a1",
  },
  {
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
    displayName: "Attribut: a2",
  },
  {
    defaultNode: {
      language: "dxml",
      name: "text",
      properties: {
        "value": "Neuer Text",
      }
    },
    displayName: "Text",
  },
];

const SIDEBAR_BLOCKS_DYNAMIC: SidebarBlockDescription[] = [
  {
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
                {
                  language: "dxml",
                  name: "exprVar",
                  properties: {
                    "name": "var_a"
                  }
                }
              ]
            }
          }
        ]
      }
    },
    displayName: "<%= var_a %>",
  },
  {
    defaultNode: {
      language: "dxml",
      name: "exprVar",
      properties: {
        "name": "var_a"
      }
    },
    displayName: "Variable a",
  },
  {
    defaultNode: {
      language: "dxml",
      name: "exprVar",
      properties: {
        "name": "var_b"
      }
    },
    displayName: "Variable b",
  },
  {
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
    displayName: "<% if %>",
  },
]

const EDITOR_BLOCKS = [
  {
    describedType: {
      languageName: "dxml",
      typeName: "element"
    },
    visual: [
      {
        blockType: "block",
        direction: "horizontal",
        dropTarget: {
          children: {
            category: "elements",
            order: "insertFirst"
          }
        },
        children: [
          {
            blockType: "constant",
            text: "<",
            style: {
              color: "blue"
            }
          } as VisualBlockDescriptions.EditorConstant,
          {
            blockType: "interpolated",
            property: "name",
            style: {
              color: "#ad0000"
            }
          } as VisualBlockDescriptions.EditorInterpolated,
          {
            blockType: "iterator",
            childGroupName: "attributes",
            direction: "horizontal",
          } as VisualBlockDescriptions.EditorIterator,
          {
            blockType: "dropTarget",
            dropTarget: {
              children: {
                category: "attributes",
                order: "insertLast"
              },
              visibility: ["ifLegalChild"]
            },
            children: [
              {
                blockType: "constant",
                text: "+Attribute"
              } as VisualBlockDescriptions.EditorConstant,
            ],
            direction: "horizontal",
            style: {
              marginLeft: "10px",
            },
          } as VisualBlockDescriptions.EditorDropTarget,
          {
            blockType: "constant",
            text: ">",
            style: {
              color: "blue"
            }
          } as VisualBlockDescriptions.EditorConstant,
          {
            blockType: "dropTarget",
            dropTarget: {
              children: {
                category: "elements",
                order: "insertFirst"
              },
              visibility: ["ifLegalChild"]
            },
            children: [
              {
                blockType: "constant",
                text: "+Kind"
              } as VisualBlockDescriptions.EditorConstant,
            ],
            direction: "horizontal",
            style: {
              marginLeft: "10px",
            },
          } as VisualBlockDescriptions.EditorDropTarget,
        ]
      } as VisualBlockDescriptions.EditorBlock,
      {
        blockType: "iterator",
        childGroupName: "elements",
        direction: "vertical",
        style: {
          marginLeft: "10px",
        },
      } as VisualBlockDescriptions.EditorIterator,
      {
        blockType: "block",
        direction: "horizontal",
        children: [
          {
            blockType: "constant",
            text: "</",
            style: {
              color: "blue"
            }
          } as VisualBlockDescriptions.EditorConstant,
          {
            blockType: "interpolated",
            property: "name",
            style: {
              color: "#ad0000"
            }
          } as VisualBlockDescriptions.EditorInterpolated,
          {
            blockType: "constant",
            text: ">",
            style: {
              color: "blue"
            }
          } as VisualBlockDescriptions.EditorConstant,
        ]
      } as VisualBlockDescriptions.EditorBlock
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
        style: {
          marginLeft: "10px",
        },
        children: [
          {
            blockType: "interpolated",
            property: "name",
            style: {
              color: "#ef4040"
            }
          } as VisualBlockDescriptions.EditorInterpolated,
          {
            blockType: "constant",
            text: "="
          } as VisualBlockDescriptions.EditorConstant,
          {
            blockType: "constant",
            text: "\""
          } as VisualBlockDescriptions.EditorConstant,
          {
            blockType: "iterator",
            childGroupName: "value",
            direction: "horizontal",
            style: {
              color: "blue"
            }
          } as VisualBlockDescriptions.EditorIterator,
          {
            blockType: "constant",
            text: "\""
          } as VisualBlockDescriptions.EditorConstant,
        ]
      } as VisualBlockDescriptions.EditorBlock
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
            blockType: "input",
            property: "value"
          } as VisualBlockDescriptions.EditorInput,
        ]
      } as VisualBlockDescriptions.EditorBlock
    ]
  },
  {
    describedType: {
      languageName: "dxml",
      typeName: "interpolate",
    },
    visual: [
      {
        blockType: "block",
        direction: "horizontal",
        children: [
          {
            blockType: "constant",
            text: "{{"
          } as VisualBlockDescriptions.EditorConstant,
          {
            blockType: "iterator",
            childGroupName: "expr",
            direction: "horizontal",
          } as VisualBlockDescriptions.EditorIterator,
          {
            blockType: "constant",
            text: "}}"
          } as VisualBlockDescriptions.EditorConstant,
        ]
      } as VisualBlockDescriptions.EditorBlock
    ]
  },
  {
    describedType: {
      languageName: "dxml",
      typeName: "expr",
    },
    visual: [
      {
        blockType: "iterator",
        childGroupName: "concreteExpr",
        direction: "horizontal",
      } as VisualBlockDescriptions.EditorIterator,
    ]
  },
  {
    describedType: {
      languageName: "dxml",
      typeName: "exprVar",
    },
    visual: [
      {
        blockType: "block",
        direction: "horizontal",
        children: [
          {
            blockType: "interpolated",
            property: "name"
          } as VisualBlockDescriptions.EditorInterpolated,
        ]
      } as VisualBlockDescriptions.EditorBlock
    ]
  },
]

export const DYNAMIC_LANGUAGE_MODEL: BlockLanguageDescription = {
  id: "xml",
  name: "XML (Statisch)",
  defaultProgrammingLanguage: "dxml",
  sidebars: [
    {
      type: "fixedBlocks",
      caption: "XML (Statisch)",
      categories: [
        {
          categoryCaption: "Kern",
          blocks: SIDEBAR_BLOCKS_BASIC,
        }
      ]
    }
  ],
  editorBlocks: EDITOR_BLOCKS
}

export const LANGUAGE_MODEL: BlockLanguageDescription = {
  id: "dxml",
  name: "XML (Dynamisch)",
  defaultProgrammingLanguage: "dxml",
  sidebars: [
    {
      type: "fixedBlocks",
      caption: "XML (Dynamisch)",
      categories: [
        {
          categoryCaption: "Kern",
          blocks: SIDEBAR_BLOCKS_BASIC,
        },
        {
          categoryCaption: "Steuerung",
          blocks: SIDEBAR_BLOCKS_DYNAMIC,
        }
      ]
    }
  ],
  editorBlocks: EDITOR_BLOCKS
}

