import { LanguageModelDescription } from '../language-model.description'
import {
  SidebarBlockDescription, EditorBlockDescription, VisualBlockDescriptions
} from '../block.description'


const SIDEBAR_BLOCKS_BASIC = [
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
    sidebar: {
      category: "Dynamisches XML",
      displayName: "Element: ~~Complex~~",
    },
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
    sidebar: {
      category: "Dynamisches XML",
      displayName: "Element: e1",
    },
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
    sidebar: {
      category: "Dynamisches XML",
      displayName: "Element: e2",
    },
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
    sidebar: {
      category: "Dynamisches XML",
      displayName: "Attribut: a1",
    }
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
    sidebar: {
      category: "Dynamisches XML",
      displayName: "Attribut: a2",
    }
  },
  {
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
];

const SIDEBAR_BLOCKS_DYNAMIC = [
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
    sidebar: {
      category: "Dynamisches XML",
      displayName: "<%= var_a %>",
    }
  },
  {
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
        children: [
          {
            blockType: "constant",
            text: "<"
          } as VisualBlockDescriptions.EditorConstant,
          {
            blockType: "interpolated",
            property: "name"
          } as VisualBlockDescriptions.EditorInterpolated,
          {
            blockType: "dropTarget",
            dropTarget: {
              actionParent: "attributes"
            },
            children: [
              {
                blockType: "constant",
                text: "+Attribute"
              } as VisualBlockDescriptions.EditorConstant,
            ],
            direction: "horizontal",
            marginLeft: "10px",
            visibility: ["ifEmpty", "ifLegalDrag"]
          } as VisualBlockDescriptions.EditorDropTarget,
          {
            blockType: "iterator",
            childGroupName: "attributes",
            direction: "horizontal",
          } as VisualBlockDescriptions.EditorIterator,
          {
            blockType: "constant",
            text: ">"
          } as VisualBlockDescriptions.EditorConstant,
          {
            blockType: "dropTarget",
            dropTarget: {
              actionParent: "elements"
            },
            children: [
              {
                blockType: "constant",
                text: "+Element"
              } as VisualBlockDescriptions.EditorConstant,
            ],
            direction: "horizontal",
            marginLeft: "10px",
            visibility: ["ifLegalDrag"]
          } as VisualBlockDescriptions.EditorDropTarget,
        ]
      } as VisualBlockDescriptions.EditorBlock,
      {
        blockType: "iterator",
        childGroupName: "elements",
        direction: "vertical",
        marginLeft: "10px",
      } as VisualBlockDescriptions.EditorIterator,
      {
        blockType: "block",
        direction: "horizontal",
        children: [
          {
            blockType: "constant",
            text: "</"
          } as VisualBlockDescriptions.EditorConstant,
          {
            blockType: "interpolated",
            property: "name"
          } as VisualBlockDescriptions.EditorInterpolated,
          {
            blockType: "constant",
            text: ">"
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
        marginLeft: "10px",
        children: [
          {
            blockType: "interpolated",
            property: "name"
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
            blockType: "interpolated",
            property: "value"
          } as VisualBlockDescriptions.EditorInterpolated,
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

export const DYNAMIC_LANGUAGE_MODEL: LanguageModelDescription = {
  id: "dxml",
  name: "XML (Dynamisch)",
  sidebarBlocks: [
    ...SIDEBAR_BLOCKS_BASIC,
    ...SIDEBAR_BLOCKS_DYNAMIC,
  ],
  editorBlocks: EDITOR_BLOCKS
}

export const LANGUAGE_MODEL: LanguageModelDescription = {
  id: "xml",
  name: "XML",
  sidebarBlocks: [
    ...SIDEBAR_BLOCKS_BASIC,
  ],
  editorBlocks: EDITOR_BLOCKS
}

