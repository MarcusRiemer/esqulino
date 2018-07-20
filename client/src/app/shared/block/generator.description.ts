import { GrammarDescription } from '../syntaxtree/grammar.description'
import { QualifiedTypeName } from '../syntaxtree/syntaxtree.description'

import { EditorComponentDescription } from './block-language.description'
import { VisualBlockDescriptions, Orientation } from './block.description'


export interface Instructions {
  orientation: Orientation;
  between: string;
  style: { [attribute: string]: string }
}

export type LayoutInstructions = Pick<Instructions, "orientation" | "between" | "style">;
export type BlockInstructions = Pick<Instructions, "orientation" | "style">;
export type TerminalInstructions = Pick<Instructions, "style">;

export module DefaultInstructions {
  export const layoutInstructions: LayoutInstructions = {
    orientation: "horizontal",
    between: "",
    style: {}
  }

  export const blockInstructions: BlockInstructions = {
    orientation: "horizontal",
    style: {}
  }

  export const terminalInstructions: TerminalInstructions = {
    style: {
      "display": "inline-block"
    }
  }
}

/**
 * Supplementary generation instructions for a specific type.
 */
export type TypeInstructions = {
  [language: string]: {
    [type: string]: {
      [scope: string]: Partial<Instructions>
    }
  }
}

/**
 * The nested parts of the generator description that must be stored
 * as a JSON "blob".
 */
export interface BlockLanguageGeneratorDocument {
  editorComponents: EditorComponentDescription[];
  typeInstructions?: TypeInstructions;
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
