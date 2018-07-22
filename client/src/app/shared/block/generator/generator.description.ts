import { GrammarDescription } from '../../syntaxtree/grammar.description'
import { QualifiedTypeName } from '../../syntaxtree/syntaxtree.description'

import { EditorComponentDescription } from '../block-language.description'
import { VisualBlockDescriptions } from '../block.description'

import {
  AllTypeInstructions
} from './instructions.description'

/**
 * The nested parts of the generator description that must be stored
 * as a JSON "blob".
 */
export interface BlockLanguageGeneratorDocument {
  editorComponents: EditorComponentDescription[];
  typeInstructions?: AllTypeInstructions;
}

/**
 * "Superficial" attribues of a block language generator
 */
export interface BlockLanguageGeneratorListDescription {
  id: string;
  name: string;
}

/**
 * Describes how a grammar might be converted to a block language
 */
export interface BlockLanguageGeneratorDescription extends BlockLanguageGeneratorDocument, BlockLanguageGeneratorListDescription {
}

/**
 * No idea how parameters for generators will work in the future. In the meantime
 * we will use this handy default object instead of loading data from the server.
 */
export const DEFAULT_GENERATOR: BlockLanguageGeneratorDescription = {
  editorComponents: [],
  typeInstructions: {
    "sql": {
      "binaryExpression": {
        "operator": {
          "style": {
            "margin-left": "1ch",
            "margin-right": "1ch",
          }
        }
      },
      "functionCall": {
        "name": {
          "readOnly": true
        }
      },
      "select": {
        "keyword": {
          "style": {
            "width": "9ch",
            "color": "blue",
          }
        },
        "columns": {
          "orientation": "horizontal",
          "between": ","
        }
      },
      "from": {
        type: "multi",
        blocks: [
          {
            "this": {
              "attributeMappingMode": "mentioned",
            },
            "keyword": {
              "style": {
                "width": "9ch",
                "color": "blue",
              }
            },
            "tables": {
              "between": ","
            }
          },
          {
            "this": {
              "attributeMappingMode": "mentioned",
            },
            "joins": {
              "orientation": "vertical"
            }
          }
        ]
      },
      "where": {
        "keyword": {
          "style": {
            "width": "9ch",
            "color": "blue",
          }
        },
      },
      "groupBy": {
        "keyword": {
          "style": {
            "width": "9ch",
            "color": "blue",
          }
        },
      },
      "orderBy": {
        "keyword": {
          "style": {
            "width": "9ch",
            "color": "blue",
          }
        },
      },
      "innerJoinOn": {
        "keyword": {
          "style": {
            "margin-left": "2ch",
            "margin-right": "1ch",
            "color": "blue",
          }
        },
        "keywordOn": {
          "style": {
            "margin-left": "1ch",
            "margin-right": "1ch",
            "color": "blue",
          }
        }
      },
      "querySelect": {
        "this": {
          "orientation": "vertical",
        }
      }
    },
    "dxml": {
      "element": {
        type: "multi",
        blocks: [
          {
            "this": {
              "attributeMappingMode": "mentioned"
            },
            "tag-open-begin": {
              style: {
                color: "blue"
              }
            },
            "name": {
              style: {
                color: "#ad0000"
              }
            },
            "attributes": {
              "between": " ",
            },
            "tag-open-end": {
              style: {
                color: "blue"
              }
            },
          },
          {
            "this": {
              "attributeMappingMode": "mentioned",
              "style": {
                "margin-left": "2ch"
              }
            },
            "elements": {
              "orientation": "vertical",
            }
          },
          {
            "this": {
              "attributeMappingMode": "mentioned"
            },
            "tag-close": {}
          }
        ]
      },
      "attribute": {
        "name": {
          "style": {
            "margin-left": "1ch",
            "color": "#ef4040"
          }
        }
      }
    }
  },
  id: undefined,
  name: undefined
};
