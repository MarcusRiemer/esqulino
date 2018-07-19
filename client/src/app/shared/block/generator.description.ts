import { GrammarDescription } from '../syntaxtree/grammar.description'
import { QualifiedTypeName } from '../syntaxtree/syntaxtree.description'

import { EditorComponentDescription } from './block-language.description'
import { VisualBlockDescriptions, Orientation } from './block.description'


export interface Instructions {
  orientation: Orientation;
  between: string;
}

export type LayoutInstructions = Pick<Instructions, "orientation" | "between">;
export type BlockInstructions = Pick<Instructions, "orientation">

export module DefaultInstructions {
  export const layoutInstructions: LayoutInstructions = {
    orientation: "horizontal",
    between: ","
  }

  export const blockInstructions: BlockInstructions = {
    orientation: "horizontal",
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
 * we will use this handy default object.
 */
export const DEFAULT_GENERATOR: BlockLanguageGeneratorDescription = {
  editorComponents: [],
  typeInstructions: {
    "sql": {
      "select": {
        "columns": {
          "orientation": "horizontal",
          "between": ", "
        }
      },
      "querySelect": {
        "this": {
          "orientation": "vertical",
        }
      }
    },
    "dxml": {

    }
  },
  id: undefined,
  name: undefined
};
