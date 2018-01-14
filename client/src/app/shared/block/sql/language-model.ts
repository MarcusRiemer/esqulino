import { LanguageModelDescription } from '../language-model.description'
import {
  SidebarBlockDescription, EditorBlockDescription, VisualBlockDescriptions
} from '../block.description'

export const LANGUAGE_MODEL: LanguageModelDescription = {
  id: "sql",
  name: "SQL",
  editorBlocks: [],
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
          "components": [
            {
              language: "sql",
              name: "select",
            }
          ]
        }
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
    }
  ]
}