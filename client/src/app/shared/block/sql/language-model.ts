import { BlockLanguageDescription } from '../block-language.description'
import {
  SidebarBlockDescription, EditorBlockDescription, VisualBlockDescriptions
} from '../block.description'

export const LANGUAGE_MODEL: BlockLanguageDescription = {
  id: "db441c27-6a19-4f2f-95a9-f3bc44675b4f",
  slug: "sql",
  name: "SQL",
  defaultProgrammingLanguageId: "sql",
  editorComponents: [
    { componentType: "query-preview" }
  ],
  sidebars: [
    {
      type: "databaseSchema",
    },
    {
      type: "fixedBlocks",
      caption: "SQL",
      categories: [
        {
          categoryCaption: "Ausdrücke",
          blocks: [
            {
              displayName: "★",
              defaultNode: {
                language: "sql",
                name: "starOperator",
              }
            },
            {
              displayName: ":parameter",
              defaultNode: {
                language: "sql",
                name: "parameter",
                properties: {
                  name: "param"
                }
              }
            },
            {
              displayName: "Konstante",
              defaultNode: {
                language: "sql",
                name: "constant",
                properties: {
                  value: "wert"
                }
              }
            },
            {
              displayName: "Binärer Ausdruck",
              defaultNode: {
                language: "sql",
                name: "binaryExpression",
                children: {
                  lhs: [],
                  operator: [
                    {
                      language: "sql",
                      name: "relationalOperator",
                      properties: {
                        operator: "="
                      }
                    }
                  ],
                  rhs: []
                }
              }
            },
          ]
        },
        {
          categoryCaption: "Komponenten",
          blocks: [
            {
              displayName: "SELECT",
              defaultNode: {
                language: "sql",
                name: "querySelect",
                children: {
                  "select": [
                    {
                      language: "sql",
                      name: "select",
                    }
                  ],
                  "from": [
                    {
                      language: "sql",
                      name: "from",
                    }
                  ],
                  "where": [
                  ],
                  "groupBy": [
                  ]
                }
              }
            },
            {
              displayName: "FROM",
              defaultNode: {
                language: "sql",
                name: "from",
                children: {
                  "tables": []
                }
              }
            },
            {
              displayName: "JOIN",
              defaultNode: {
                language: "sql",
                name: "crossJoin",
                children: {
                  "table": []
                }
              }
            },
            {
              displayName: "INNER JOIN USING",
              defaultNode: {
                language: "sql",
                name: "innerJoinUsing",
                children: {
                  "table": [],
                  "using": []
                }
              }
            },
            {
              displayName: "INNER JOIN ON",
              defaultNode: {
                language: "sql",
                name: "innerJoinOn",
                children: {
                  "table": [],
                  "on": []
                }
              }
            },
            {
              displayName: "WHERE",
              defaultNode: {
                language: "sql",
                name: "where",
                children: {
                  "expressions": []
                }
              }
            },
            {
              displayName: "GROUP BY",
              defaultNode: {
                language: "sql",
                name: "groupBy",
                children: {
                  "expressions": []
                }
              }
            },
          ]
        }
      ]
    }
  ],
  editorBlocks: [
    {
      describedType: {
        languageName: "sql",
        typeName: "querySelect",
      },
      visual: [
        {
          blockType: "iterator",
          childGroupName: "select",
          direction: "horizontal",
        } as VisualBlockDescriptions.EditorIterator,
        {
          blockType: "iterator",
          childGroupName: "from",
          direction: "horizontal",
        } as VisualBlockDescriptions.EditorIterator,
        {
          blockType: "dropTarget",
          dropTarget: {
            parent: {
              category: "where",
              order: "insertFirst"
            },
            visibility: ["ifLegalChild"]
          },
          children: [
            {
              blockType: "constant",
              text: "+WHERE"
            } as VisualBlockDescriptions.EditorConstant,
          ],
          direction: "horizontal",
        } as VisualBlockDescriptions.EditorDropTarget,
        {
          blockType: "iterator",
          childGroupName: "where",
          direction: "horizontal",
        } as VisualBlockDescriptions.EditorIterator,
        {
          blockType: "dropTarget",
          dropTarget: {
            parent: {
              category: "groupBy",
              order: "insertFirst"
            },
            visibility: ["ifLegalChild"]
          },
          children: [
            {
              blockType: "constant",
              text: "+GROUP BY"
            } as VisualBlockDescriptions.EditorConstant,
          ],
          direction: "horizontal",
        } as VisualBlockDescriptions.EditorDropTarget,
        {
          blockType: "iterator",
          childGroupName: "groupBy",
          direction: "horizontal",
        } as VisualBlockDescriptions.EditorIterator,
      ]
    },
    {
      describedType: {
        languageName: "sql",
        typeName: "select"
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          dropTarget: {
            children: {
              order: "insertFirst",
              category: "columns"
            },
            visibility: ["ifLegalChild"]
          },
          children: [
            {
              blockType: "constant",
              text: "SELECT",
              style: {
                width: "9ch",
                display: "inline-block",
                color: "blue",
                "padding-left": "2px",
                "background": "url(/vendor/icons/block-background.svg) no-repeat",
                "background-size": "100% 100%",
              }
            } as VisualBlockDescriptions.EditorConstant,
            {
              blockType: "dropTarget",
              dropTarget: {
                children: {
                  category: "columns",
                  order: "insertFirst"
                },
                visibility: ["ifEmpty", "ifLegalChild"]
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
            } as VisualBlockDescriptions.EditorDropTarget,
            {
              blockType: "iterator",
              childGroupName: "columns",
              direction: "horizontal",
              between: [
                {
                  blockType: "constant",
                  text: ", "
                } as VisualBlockDescriptions.EditorConstant,
              ]
            } as VisualBlockDescriptions.EditorIterator,
          ]
        },
      ]
    },
    {
      describedType: {
        languageName: "sql",
        typeName: "columnName",
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          style: {
            "paddingLeft": "10px",
            "paddingRight": "10px",
            "margin-top": "2px",
            "margin-bottom": "2px",
            "background-color": "rgba(0, 255, 0, 0.15)",
            "border": "2px solid rgba(0, 255, 0, 0.6)",
            "borderRadius": "500px",
            "cursor": "grab",
          },
          children: [
            {
              blockType: "interpolated",
              property: "refTableName",
            } as VisualBlockDescriptions.EditorInterpolated,
            {
              blockType: "constant",
              text: "."
            },
            {
              blockType: "interpolated",
              property: "columnName",
            } as VisualBlockDescriptions.EditorInterpolated,
          ]
        } as VisualBlockDescriptions.EditorBlock,
      ]
    },
    {
      describedType: {
        languageName: "sql",
        typeName: "starOperator",
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          style: {
            "paddingLeft": "10px",
            "paddingRight": "10px",
            "margin-top": "2px",
            "margin-bottom": "2px",
            "background-color": "rgba(0, 255, 0, 0.15)",
            "border": "2px solid rgba(0, 255, 0, 0.6)",
            "border-radius": "500px",
            "cursor": "grab",
          },
          children: [
            {
              blockType: "constant",
              text: "★",
            } as VisualBlockDescriptions.EditorConstant,
          ]
        }
      ]
    },
    {
      describedType: {
        languageName: "sql",
        typeName: "parameter",
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          style: {
            "paddingLeft": "10px",
            "paddingRight": "10px",
            "margin-top": "2px",
            "margin-bottom": "2px",
            "border": "2px solid rgba(129, 129, 247, 1)",
            "background-color": "rgba(129, 129, 247, 0.4)",
            "borderRadius": "500px",
            "cursor": "grab",
          },
          children: [
            {
              blockType: "constant",
              text: ":",
            } as VisualBlockDescriptions.EditorConstant,
            {
              blockType: "input",
              property: "name",
              style: {
                "cursor": "text",
                "text-decoration": "underline black dotted",
              }
            } as VisualBlockDescriptions.EditorInput,
          ]
        }
      ]
    },
    {
      describedType: {
        languageName: "sql",
        typeName: "constant",
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          style: {
            "paddingLeft": "10px",
            "paddingRight": "10px",
            "margin-top": "2px",
            "margin-bottom": "2px",
            "background-color": "rgba(0, 255, 0, 0.15)",
            "border": "2px solid rgba(0, 255, 0, 0.6)",
            "borderRadius": "500px",
            "text-decoration": "underline black dotted",
          },
          children: [
            {
              style: {
                "cursor": "text",
              },
              blockType: "input",
              property: "value",
            } as VisualBlockDescriptions.EditorInput,
          ]
        }
      ]
    },
    {
      describedType: {
        languageName: "sql",
        typeName: "binaryExpression",
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          style: {
            "paddingLeft": "10px",
            "paddingRight": "10px",
            "margin-top": "2px",
            "margin-bottom": "2px",
            "border": "2px solid rgba(255, 165, 0, 0.6)",
            "backgroundColor": "rgba(255, 165, 0, 0.3)",
            "borderRadius": "500px",
            "cursor": "grab",
          },
          children: [
            {
              blockType: "dropTarget",
              dropTarget: {
                children: {
                  category: "lhs",
                  order: "insertFirst"
                },
                visibility: ["ifEmpty", "ifLegalChild"]
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
            } as VisualBlockDescriptions.EditorDropTarget,
            {
              blockType: "iterator",
              childGroupName: "lhs",
              direction: "horizontal",
            },
            {
              blockType: "dropTarget",
              dropTarget: {
                children: {
                  category: "operator",
                  order: "insertFirst"
                },
                visibility: ["ifEmpty", "ifLegalChild"]
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
            } as VisualBlockDescriptions.EditorDropTarget,
            {
              blockType: "iterator",
              childGroupName: "operator",
              direction: "horizontal",
            },
            {
              blockType: "dropTarget",
              dropTarget: {
                children: {
                  category: "rhs",
                  order: "insertFirst"
                },
                visibility: ["ifEmpty", "ifLegalChild"]
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
            } as VisualBlockDescriptions.EditorDropTarget,
            {
              blockType: "iterator",
              childGroupName: "rhs",
              direction: "horizontal",
            }
          ]
        }
      ]
    },
    {
      describedType: {
        languageName: "sql",
        typeName: "relationalOperator",
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          children: [
            {
              blockType: "input",
              property: "operator",
              style: {
                "padding": "0 3px",
                "margin": "1px 1ch",
                "border": "2px solid transparent",
                "borderRadius": "500px",
                "backgroundColor": "gray",
                "cursor": "text",
              },
            } as VisualBlockDescriptions.EditorInput,
          ]
        }
      ]
    },
    {
      describedType: {
        languageName: "sql",
        typeName: "from",
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          dropTarget: {
            children: {
              category: "tables",
              order: "insertFirst",
            },
            visibility: ["ifLegalChild"]
          },
          children: [
            {
              blockType: "constant",
              text: "FROM",
              style: {
                width: "9ch",
                display: "inline-block",
                color: "blue",
              }
            },
            {
              blockType: "dropTarget",
              dropTarget: {
                children: {
                  category: "tables",
                  order: "insertFirst"
                },
                visibility: ["ifEmpty", "ifLegalChild"]
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
            } as VisualBlockDescriptions.EditorDropTarget,
            {
              blockType: "iterator",
              childGroupName: "tables",
              direction: "vertical",
              between: []
            } as VisualBlockDescriptions.EditorIterator,
          ],
        },
        {
          blockType: "dropTarget",
          dropTarget: {
            children: {
              category: "tables",
              order: "insertLast"
            },
            visibility: ["ifLegalChild"]
          },
          children: [
            {
              blockType: "constant",
              text: "+JOIN"
            } as VisualBlockDescriptions.EditorConstant,
          ],
          direction: "horizontal",
        } as VisualBlockDescriptions.EditorDropTarget
      ],
    },
    {
      describedType: {
        languageName: "sql",
        typeName: "crossJoin",
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          dropTarget: {
            children: {
              category: "table",
              order: "insertFirst",
            },
            visibility: ["ifLegalChild"]
          },
          children: [
            {
              blockType: "constant",
              text: "JOIN",
              style: {
                width: "10ch",
                marginLeft: "10px",
                display: "inline-block",
                color: "blue"
              }
            },
            {
              blockType: "iterator",
              childGroupName: "table",
              direction: "horizontal",
            } as VisualBlockDescriptions.EditorIterator,
          ],
        },
      ]
    },
    {
      describedType: {
        languageName: "sql",
        typeName: "innerJoinUsing",
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          dropTarget: {
            children: {
              category: "table",
              order: "insertFirst",
            },
            visibility: ["ifLegalChild"]
          },
          children: [
            {
              blockType: "constant",
              text: "INNER JOIN",
              style: {
                width: "10ch",
                marginLeft: "10px",
                display: "inline-block",
                color: "blue"
              }
            },
            {
              blockType: "iterator",
              childGroupName: "table",
              direction: "horizontal",
            } as VisualBlockDescriptions.EditorIterator,
            {
              blockType: "dropTarget",
              dropTarget: {
                children: {
                  category: "using",
                  order: "insertFirst"
                },
                visibility: ["always"],
              },
              direction: "horizontal",
              children: [
                {
                  blockType: "constant",
                  text: "USING",
                  style: {
                    width: "100px",
                    marginLeft: "10px",
                    display: "inline-block",
                    color: "blue"
                  }
                },
              ]
            },
            {
              blockType: "iterator",
              childGroupName: "using",
              direction: "horizontal",
            } as VisualBlockDescriptions.EditorIterator,
          ],
        },
      ]
    },
    {
      describedType: {
        languageName: "sql",
        typeName: "innerJoinOn",
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          dropTarget: {
            children: {
              category: "table",
              order: "insertFirst",
            },
            visibility: ["ifLegalChild"],
          },
          children: [
            {
              blockType: "constant",
              text: "INNER JOIN",
              style: {
                width: "10ch",
                marginLeft: "10px",
                display: "inline-block",
                color: "blue"
              }
            },
            {
              blockType: "iterator",
              childGroupName: "table",
              direction: "horizontal",
            } as VisualBlockDescriptions.EditorIterator,
            {
              blockType: "dropTarget",
              dropTarget: {
                children: {
                  category: "on",
                  order: "insertFirst"
                },
                visibility: ["always"],
              },
              direction: "horizontal",
              children: [
                {
                  blockType: "constant",
                  text: "ON",
                  style: {
                    width: "100px",
                    marginLeft: "10px",
                    display: "inline-block",
                    color: "blue"
                  }
                },
              ]
            },
            {
              blockType: "iterator",
              childGroupName: "on",
              direction: "horizontal",
            } as VisualBlockDescriptions.EditorIterator,
          ],
        },
      ]
    },
    {
      describedType: {
        languageName: "sql",
        typeName: "tableIntroduction",
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          style: {
            "paddingLeft": "10px",
            "paddingRight": "10px",
            "margin-top": "2px",
            "margin-bottom": "2px",
            "background-color": "rgba(255, 255, 0, 0.2)",
            "border": "2px solid rgba(255, 255, 0, 0.9)",
            "borderRadius": "500px",
            "cursor": "grab",
          },
          children: [
            {
              blockType: "interpolated",
              property: "name",
            } as VisualBlockDescriptions.EditorInterpolated,
          ]
        }
      ]
    },
    {
      describedType: {
        languageName: "sql",
        typeName: "where"
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          dropTarget: {
            children: {
              category: "expressions",
              order: "insertFirst",
            },
            visibility: ["ifLegalChild"]
          },
          children: [
            {
              blockType: "constant",
              text: "WHERE",
              style: {
                width: "9ch",
                display: "inline-block",
                color: "blue"
              }
            } as VisualBlockDescriptions.EditorConstant,
            {
              blockType: "dropTarget",
              dropTarget: {
                children: {
                  category: "expressions",
                  order: "insertFirst"
                },
                visibility: ["ifEmpty", "ifLegalChild"]
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
            } as VisualBlockDescriptions.EditorDropTarget,
            {
              blockType: "iterator",
              childGroupName: "expressions",
              direction: "horizontal",
              between: [
                {
                  blockType: "constant",
                  text: ", "
                } as VisualBlockDescriptions.EditorConstant,
              ]
            } as VisualBlockDescriptions.EditorIterator,
          ]
        }
      ]
    },
    {
      describedType: {
        languageName: "sql",
        typeName: "groupBy"
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          dropTarget: {
            children: {
              category: "expressions",
              order: "insertFirst",
            },
            visibility: ["ifLegalChild"]
          },
          children: [
            {
              blockType: "constant",
              text: "GROUP BY",
              style: {
                width: "9ch",
                display: "inline-block",
                color: "blue"
              }
            } as VisualBlockDescriptions.EditorConstant,
            {
              blockType: "dropTarget",
              dropTarget: {
                children: {
                  category: "expressions",
                  order: "insertFirst"
                },
                visibility: ["ifEmpty", "ifLegalChild"]
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
            } as VisualBlockDescriptions.EditorDropTarget,
            {
              blockType: "iterator",
              childGroupName: "expressions",
              direction: "horizontal",
              between: [
                {
                  blockType: "constant",
                  text: ", "
                } as VisualBlockDescriptions.EditorConstant,
              ]
            } as VisualBlockDescriptions.EditorIterator,
          ]
        }
      ]
    },
  ],
}
