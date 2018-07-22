import { Orientation } from '../block.description'

// Describes which attributes of a certain type are used
// in the block that is being created.
export type AttributeMappingMode = "all" | "mentioned";

/**
 * Customization instructions for a specific visual that may be specified by a user.
 */
export interface Instructions {
  orientation: Orientation; // Whether children should be layed out vertically or horizontally
  between: string; // Separetes iterated elements
  attributeMappingMode: AttributeMappingMode;
  style: { [attribute: string]: string };
  readOnly: boolean;
}

/**
 * Instructions that are useful on an iterating visual.
 */
export type IteratorInstructions = Readonly<Pick<Instructions, "orientation" | "between" | "style">>;

/**
 * Instructions that are useful on a block visual.
 */
export type BlockInstructions = Readonly<Pick<Instructions, "attributeMappingMode" | "orientation" | "style">>;

/**
 * Instructions that are useful on a terminal visual.
 */
export type TerminalInstructions = Readonly<Pick<Instructions, "style">>;

/**
 * Instructions that are useful on a property.
 */
export type PropertyInstructions = Readonly<Pick<Instructions, "style" | "readOnly">>;

/**
 * Default options for the various types of blocks
 */
export module DefaultInstructions {
  export const iteratorInstructions: IteratorInstructions = {
    orientation: "horizontal",
    between: "",
    style: {}
  }

  export const blockInstructions: BlockInstructions = {
    orientation: "horizontal",
    attributeMappingMode: "all",
    style: {}
  }

  export const terminalInstructions: TerminalInstructions = {
    style: {
      "display": "inline-block"
    }
  }

  export const propertyInstructions: PropertyInstructions = {
    readOnly: false,
    style: {
      "display": "inline-block"
    }
  }
}

export type SingleBlockInstructionsDescription = {
  [scope: string]: Partial<Instructions>
};

export type MultiBlockInstructionsDescription = {
  type: "multi",
  blocks: SingleBlockInstructionsDescription[]
}

export function isMultiBlockInstructions(x: any): x is MultiBlockInstructionsDescription {
  return (typeof (x) === "object" && x.type === "multi" && typeof (x.blocks) === "object");
}

/**
 *
 */
export type TypeInstructions = SingleBlockInstructionsDescription | MultiBlockInstructionsDescription

/**
 * Supplementary generation instructions for all types.
 */
export type AllTypeInstructions = {
  [language: string]: {
    [type: string]: TypeInstructions
  }
}
