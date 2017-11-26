import { LanguageModelDescription } from '../language-model.description'
import { SidebarBlockDescription } from '../block.description'

export const LANGUAGE_MODEL: LanguageModelDescription = {
  id: "xml",
  name: "Allgemeines XML",
  sidebarBlocks: [
    {
      describedType: {
        languageName: "xml",
        typeName: "node"
      },
      defaultNode: {
        language: "xml",
        name: "node",
        children: {
          "nodes": [],
          "attributes": [],
        },
        properties: {
          "name": ""
        }
      },
      sidebar: {
        category: "Allgemeines XML",
        displayName: "Knoten",
      }
    },
    {
      describedType: {
        languageName: "xml",
        typeName: "attribute"
      },
      defaultNode: {
        language: "xml",
        name: "attribute",
        properties: {
          "key": "",
          "value": ""
        }
      },
      sidebar: {
        category: "Allgemeines XML",
        displayName: "Attribut",
      }
    }
  ],
  editorBlocks: []
}
