import { Orientation, VisualBlockDescriptions } from '../block.description'

// Alias to shorten some typing
type DropTargetProperties = VisualBlockDescriptions.DropTargetProperties;

// Describes which attributes of a certain type are used
// in the block that is being created.
export type AttributeMappingMode = "all" | "mentioned";

export type AttributeMappingOrder = "grammar" | string[];

/**
 * Customization instructions for a specific visual that may be specified by a user.
 */
export interface Instructions {
  // Controls whether children should be layed out vertically or horizontally
  orientation: Orientation;
  // Separetes iterated elements
  between: string;
  // Defines the order in which the attributes appear
  attributeMapping: AttributeMappingOrder;
  // General CSS styling instructions
  style: { [attribute: string]: string };
  // Controls whether the user may interactively change this attribute
  readOnly: boolean;
  // Controls how things dropped on here will be treated
  dropTarget: DropTargetProperties
}

/**
 * Instructions that are useful on an iterating visual.
 */
export type IteratorInstructions = Readonly<Pick<Instructions, "orientation" | "between" | "style">>;

/**
 * Instructions that are useful on a block visual.
 */
export type BlockInstructions = Readonly<Pick<Instructions, "attributeMapping" | "orientation" | "style" | "dropTarget">>;

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
    attributeMapping: "grammar",
    style: {},
    dropTarget: VisualBlockDescriptions.DefaultDropTargetProperties
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

/**
 * Instructions on how to generate a single block for a type.
 */
export type SingleBlockInstructionsDescription = {
  type: "single";
  block?: Partial<BlockInstructions>;
  attributes: {
    [scope: string]: Partial<Instructions>
  }
};

/**
 * Instructions on how to generate a type that is composed of multiple
 * blocks.
 */
export type MultiBlockInstructionsDescription = {
  type: "multi",
  blocks: SingleBlockInstructionsDescription[]
}

/**
 * Any kind of instruction on how to create one or more blocks for a type.
 */
export type TypeInstructions = SingleBlockInstructionsDescription | MultiBlockInstructionsDescription

export function isMultiBlockInstructions(x: any): x is MultiBlockInstructionsDescription {
  return (typeof (x) === "object" && x.type === "multi");
}

/**
 * Supplementary generation instructions for all types.
 */
export type AllTypeInstructions = {
  [language: string]: {
    [type: string]: TypeInstructions
  }
}
