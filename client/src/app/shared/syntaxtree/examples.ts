import { CodeResourceDescription } from './coderesource.description'

export const CODE_RESOURCES: CodeResourceDescription[] = [
  {
    id: "regex-empty",
    name: "RegEx: Leer",
    ast: undefined,
    programmingLanguageId: "regex",
    blockLanguageId: "regex",
  },
  {
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
    programmingLanguageId: "regex",
    blockLanguageId: "regex",
  },
  {
    id: "xml-empty",
    name: "XML: Leer",
    ast: undefined,
    programmingLanguageId: "dxml-eruby",
    blockLanguageId: "xml",
  },
  {
    id: "sql-empty",
    name: "SQL: Leer",
    ast: undefined,
    programmingLanguageId: "sql",
    blockLanguageId: "sql",
  }
];
