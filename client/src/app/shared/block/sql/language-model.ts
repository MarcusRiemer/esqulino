import { BlockLanguageDescription } from '../block-language.description'
import {
  SidebarBlockDescription, EditorBlockDescription, VisualBlockDescriptions
} from '../block.description'

export const LANGUAGE_MODEL: BlockLanguageDescription = {
  id: "sql",
  name: "SQL",
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
          blockType: "iterator",
          childGroupName: "where",
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
            actionParent: "columns"
          },
          children: [
            {
              blockType: "constant",
              text: "SELECT",
              style: {
                width: "100px",
                display: "inline-block",
                color: "blue"
              }
            } as VisualBlockDescriptions.EditorConstant,
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
            actionParent: "tables"
          },
          children: [
            {
              blockType: "constant",
              text: "FROM",
              style: {
                width: "100px",
                display: "inline-block",
                color: "blue"
              }
            },
            {
              blockType: "iterator",
              childGroupName: "tables",
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
        typeName: "tableIntroduction",
      },
      visual: [
        {
          blockType: "block",
          direction: "horizontal",
          style: {
            "paddingLeft": "10px",
            "paddingTop": "2px",
            "paddingRight": "10px",
            "border": "2px solid black",
            "borderRadius": "500px",
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
  ],
  sidebarBlocks: [
    {
      sidebar: {
        category: "SQL",
        displayName: "SELECT"
      },
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
      sidebar: {
        category: "SQL",
        displayName: "*"
      },
      defaultNode: {
        language: "sql",
        name: "starOperator",
      }
    },
    {
      sidebar: {
        category: "SQL",
        displayName: "FROM"
      },
      defaultNode: {
        language: "sql",
        name: "from",
        children: {
          "tables": []
        }
      }
    },
    {
      sidebar: {
        category: "SQL",
        displayName: "WHERE"
      },
      defaultNode: {
        language: "sql",
        name: "where",
        children: {
          "expressions": []
        }
      }
    },
    {
      sidebar: {
        category: "SQL",
        displayName: "Tabelle Person"
      },
      defaultNode: {
        language: "sql",
        name: "tableIntroduction",
        properties: {
          "name": "Person",
        }
      }
    },
    {
      sidebar: {
        category: "SQL",
        displayName: "Spalte Person.Id"
      },
      defaultNode: {
        language: "sql",
        name: "columnName",
        properties: {
          "columnName": "Id",
          "refTableName": "Person"
        }
      }
    },
    {
      sidebar: {
        category: "SQL",
        displayName: "Spalte Person.Vorname"
      },
      defaultNode: {
        language: "sql",
        name: "columnName",
        properties: {
          "columnName": "Vorname",
          "refTableName": "Person"
        }
      }
    },
    {
      sidebar: {
        category: "SQL",
        displayName: "Spalte Person.Nachname"
      },
      defaultNode: {
        language: "sql",
        name: "columnName",
        properties: {
          "columnName": "Nachname",
          "refTableName": "Person"
        }
      }
    },
    {
      sidebar: {
        category: "SQL",
        displayName: "Tabelle Adresse"
      },
      defaultNode: {
        language: "sql",
        name: "tableIntroduction",
        properties: {
          "name": "Adresse",
        }
      }
    }
  ]
}
