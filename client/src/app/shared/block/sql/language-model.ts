import { BlockLanguageDescription } from '../block-language.description'
import {
  SidebarBlockDescription, EditorBlockDescription, VisualBlockDescriptions
} from '../block.description'

export const LANGUAGE_MODEL: BlockLanguageDescription = {
  id: "sql",
  name: "SQL",
  sidebars: [
    {
      type: "databaseSchema",
    },
    {
      type: "fixedBlocks",
      caption: "SQL",
      categories: [
        {
          categoryCaption: "SQL",
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
              displayName: "*",
              defaultNode: {
                language: "sql",
                name: "starOperator",
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
            }
          },
          children: [
            {
              blockType: "constant",
              text: "+WHERE"
            } as VisualBlockDescriptions.EditorConstant,
          ],
          direction: "horizontal",
          visibility: ["ifLegalChild"]
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
            }
          },
          children: [
            {
              blockType: "constant",
              text: "+GROUP BY"
            } as VisualBlockDescriptions.EditorConstant,
          ],
          direction: "horizontal",
          visibility: ["ifLegalChild"]
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
            }
          },
          children: [
            {
              blockType: "constant",
              text: "SELECT",
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
                  category: "columns",
                  order: "insertFirst"
                }
              },
              children: [
                {
                  blockType: "constant",
                  text: "?",
                  style: {
                    "paddingLeft": "10px",
                    "paddingRight": "10px",
                    "border": "2px solid red",
                    "borderRadius": "500px",
                  },
                } as VisualBlockDescriptions.EditorConstant,
              ],
              direction: "horizontal",
              visibility: ["ifEmpty"]
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
            "border": "2px solid black",
            "borderRadius": "500px",
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
            "border": "2px solid black",
            "borderRadius": "500px",
          },
          children: [
            {
              blockType: "constant",
              text: "*",
            } as VisualBlockDescriptions.EditorConstant,
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
            }
          },
          children: [
            {
              blockType: "constant",
              text: "FROM",
              style: {
                width: "9ch",
                display: "inline-block",
                color: "blue"
              }
            },
            {
              blockType: "dropTarget",
              dropTarget: {
                children: {
                  category: "tables",
                  order: "insertFirst"
                }
              },
              children: [
                {
                  blockType: "constant",
                  text: "?",
                  style: {
                    "paddingLeft": "10px",
                    "paddingRight": "10px",
                    "border": "2px solid red",
                    "borderRadius": "500px",
                  },
                } as VisualBlockDescriptions.EditorConstant,
              ],
              direction: "horizontal",
              visibility: ["ifEmpty"]
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
            }
          },
          children: [
            {
              blockType: "constant",
              text: "+JOIN"
            } as VisualBlockDescriptions.EditorConstant,
          ],
          direction: "horizontal",
          visibility: ["ifLegalChild"]
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
            }
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
            }
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
                }
              },
              direction: "horizontal",
              visibility: ["always"],
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
            }
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
                }
              },
              direction: "horizontal",
              visibility: ["always"],
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
          children: [
            {
              blockType: "interpolated",
              property: "name",
              style: {
                "paddingLeft": "10px",
                "paddingTop": "2px",
                "paddingRight": "10px",
                "border": "2px solid black",
                "borderRadius": "500px",
              },
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
            }
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
                }
              },
              children: [
                {
                  blockType: "constant",
                  text: "?",
                  style: {
                    "paddingLeft": "10px",
                    "paddingRight": "10px",
                    "border": "2px solid red",
                    "borderRadius": "500px",
                  },
                } as VisualBlockDescriptions.EditorConstant,
              ],
              direction: "horizontal",
              visibility: ["ifEmpty"]
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
            }
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
                }
              },
              children: [
                {
                  blockType: "constant",
                  text: "?",
                  style: {
                    "paddingLeft": "10px",
                    "paddingRight": "10px",
                    "border": "2px solid red",
                    "borderRadius": "500px",
                  },
                } as VisualBlockDescriptions.EditorConstant,
              ],
              direction: "horizontal",
              visibility: ["ifEmpty"]
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
