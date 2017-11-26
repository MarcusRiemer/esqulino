import { CURRENT_API_VERSION } from '../resource.description'

import { CodeResourceDescription } from './coderesource.description'

export const CODE_RESOURCES: CodeResourceDescription[] = [
  {
    apiVersion: CURRENT_API_VERSION,
    id: "regex-empty",
    name: "RegEx: Leer",
    ast: undefined,
    languageId: "regex",
    languageModelId: "regex",
  },
  {
    apiVersion: CURRENT_API_VERSION,
    id: "regex-1",
    name: "RegEx: (a|b)b",
    ast: {
      "name": "root",
      "language": "regex",
      "children": {
        "expressions": [
          {
            "name": "expr",
            "language": "regex",
            "children": {
              "singleExpression": [
                {
                  "name": "alternative",
                  "language": "regex",
                  "children": {
                    "expressions": [
                      {
                        "name": "expr",
                        "language": "regex",
                        "children": {
                          "singleExpression": [
                            {
                              "name": "constant",
                              "language": "regex",
                              "properties": {
                                "value": "a"
                              }
                            }
                          ]
                        }
                      },
                      {
                        "name": "expr",
                        "language": "regex",
                        "children": {
                          "singleExpression": [
                            {
                              "name": "constant",
                              "language": "regex",
                              "properties": {
                                "value": "b"
                              }
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            "name": "expr",
            "language": "regex",
            "children": {
              "singleExpression": [
                {
                  "name": "constant",
                  "language": "regex",
                  "properties": {
                    "value": "b"
                  }
                }
              ]
            }
          }
        ]
      }
    },
    languageId: "regex",
    languageModelId: "regex",
  },
  {
    apiVersion: CURRENT_API_VERSION,
    id: "dxml-empty",
    name: "XML: Leer",
    ast: undefined,
    languageId: "dxml",
    languageModelId: "dxml",
  }
];
