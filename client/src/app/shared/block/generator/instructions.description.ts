import { Orientation, VisualBlockDescriptions } from '../block.description'
import { ParameterReferenceable } from './parameters.description';

// Alias to shorten some typing
type DropTargetProperties = VisualBlockDescriptions.DropTargetProperties;

// The attributes of a type that should be turned into visual blocks.
export type AttributeMappingOrder = "grammar" | string[];

// For iterations: Where should drop targets be displayed?
export type IterationDropTarget = "start" | "end" | "none";

/**
 * Customization instructions for a specific visual that may be specified by a user.
 */
export interface Instructions {
  // Controls whether children should be layed out vertically or horizontally
  orientation: Orientation;
  // Used to separate iterated elements
  between: string;
  // Defines the order in which the attributes appear
  attributeMapping: AttributeMappingOrder;
  // General CSS styling instructions
  style: { [attribute: string]: string };
  // Controls whether the user may interactively change this attribute
  readOnly: boolean;
  // Controls how things dropped on this block will be treated
  onDrop: DropTargetProperties;
  // Where (and if) drop targets should be created
  generateDropTargets: IterationDropTarget;
};

/**
 * Instructions where instead of a value a reference may occur. These
 * instructions can not be processed by the block language generator, but they
 * can be transformed into "proper" `Instructions` by passing them through
 * `ParameterMap.resolve`.
 */
export type ReferenceableInstructions = ParameterReferenceable<Instructions>;

/**
 * Instructions that are useful on an iterating visual.
 */
export type IteratorInstructions = Readonly<Pick<Instructions, "orientation" | "between" | "style" | "generateDropTargets">>;

/**
 * Instructions that are useful on a block visual.
 */
export type BlockInstructions = Readonly<Pick<Instructions, "attributeMapping" | "orientation" | "style" | "onDrop">>;

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
    style: {},
    generateDropTargets: "none",
  }

  export const blockInstructions: BlockInstructions = {
    orientation: "horizontal",
    attributeMapping: "grammar",
    style: {},
    onDrop: VisualBlockDescriptions.DefaultDropTargetProperties
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
export interface InternalTypeInstructionsDescription<T extends ReferenceableInstructions> {
  // TODO: Should also be referenceable
  blocks?: Partial<BlockInstructions>[];
  attributes?: {
    [scope: string]: Partial<T>
  }
};

export type TypeInstructionsDescription = InternalTypeInstructionsDescription<Instructions>;
export type ReferenceableTypeInstructionsDescription = InternalTypeInstructionsDescription<ReferenceableInstructions>;

/**
 * Supplementary generation instructions for all types. In this variant
 * all instructions are guarenteed to be resolved, there are no references
 * anywhere.
 */
export type AllTypeInstructions = {
  [language: string]: {
    [type: string]: TypeInstructionsDescription
  }
}

/**
 * Supplementary generation instructions for all types. In this variant
 * there may be references to exact values instead of the exact values
 * themselves.
 */
export type AllReferenceableTypeInstructions = {
  [language: string]: {
    [type: string]: ReferenceableTypeInstructionsDescription
  }
}
