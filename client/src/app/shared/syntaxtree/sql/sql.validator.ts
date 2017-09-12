import * as Schema from '../validator.description'

export const LANG_DESCRIPTION: Schema.LanguageDescription = {
  languageName: "sql",
  types: {
    "select": {
      children: {
        "expressions": {
          type: "allowed",
          nodeTypes: ["node"]
        }
      },
      properties: {
        "distinct": { base: "boolean" }
      }
    },
    "from": {
      children: {
        "tables": {
          type: "allowed",
          nodeTypes: ["tablename"]
        }
      }
    },
    "tablename": {
      properties: {
        "name": { base: "string" },
        "alias": { base: "string" }
      }
    }
  },
  root: []
}
