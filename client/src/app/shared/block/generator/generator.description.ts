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
        "this": {
          "orientation": "horizontal",
        },
        "keyword": {
          "style": {
            "width": "9ch",
            "color": "blue",
          }
        },
        "joins": {
          "orientation": "vertical",
        }
      },
      "where": {
        "keyword": {
          "style": {
            "width": "9ch",
            "color": "blue",
          }
        },
      },
      "querySelect": {
        "this": {
          "orientation": "vertical",
        }
      }
    },
    "dxml": {
      "element": {
        "attributes": {
          "between": " ",
        }
      }
    }
  },
  id: undefined,
  name: undefined
};
