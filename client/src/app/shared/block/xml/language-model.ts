import { LANGUAGE_DESCRIPTION } from '../../syntaxtree/xml'

import { LanguageModelDescription } from '../language-model.description'
import { BlockDescription } from '../block.description'

export const LANGUAGE_MODEL: LanguageModelDescription = {
  language: LANGUAGE_DESCRIPTION,
  blocks: [
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
        category: "XML"
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
        category: "XML"
      }
    }
  ]
}
