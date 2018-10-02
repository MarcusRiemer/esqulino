import { Orientation, VisualBlockDescriptions } from '../block.description'
import { ParameterReferenceable } from './parameters.description';

// Alias to shorten some typing
type DropTargetProperties = VisualBlockDescriptions.DropTargetProperties;

// The attributes of a type that should be turned into visual blocks.
export type AttributeMappingOrder = "grammar" | string[];

// For iterations: Where should drop targets be displayed?
export type Position = "start" | "end" | "none";

/**
 * Customization instructions for a specific visual that may be specified by a user.
 */
export interface Instructions {
  // Controls whether children should be layed out vertically or horizontally
  orientation: Orientation;
  // Allow wrapping of elements if the space is not enough
  allowWrap: boolean;
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
  generateDropTargets: Position;
  // Where (and if) to generate error indicators
  generateErrorIndicator: Position;
  // Should a break be inserted after this element?
  breakAfter: boolean;
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
export type IteratorInstructions = Readonly<Pick<Instructions, "orientation" | "between" | "style" | "generateDropTargets" | "breakAfter" | "allowWrap">>;

/**
 * Instructions that are useful on a block visual.
 */
export type BlockInstructions = Readonly<Pick<Instructions, "attributeMapping" | "orientation" | "style" | "onDrop" | "generateErrorIndicator" | "breakAfter" | "allowWrap">>;

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
    generateDropTargets: "end",
    breakAfter: false,
    allowWrap: true
  }

  export const blockInstructions: BlockInstructions = {
    orientation: "horizontal",
    attributeMapping: "grammar",
    style: {},
    onDrop: VisualBlockDescriptions.DefaultDropTargetProperties,
    generateErrorIndicator: "start",
    breakAfter: false,
    allowWrap: true
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
 * Instructions on how to generate a single block for a type. This type
 * is not intended to be used directly, please use `TypeInstructionsDescription`
 * or `ReferenceableTypeInstructionsDescription` instead.
 */
export interface InternalTypeInstructionsDescription<
  TAttr extends ReferenceableInstructions,
  TBlock extends ParameterReferenceable<BlockInstructions>
  > {
  blocks?: Partial<TBlock>[];
  attributes?: {
    [scope: string]: Partial<TAttr>
  }
};

/**
 * Fully resolved type instructions.
 */
export type TypeInstructionsDescription = InternalTypeInstructionsDescription<
  Instructions, BlockInstructions>;

/**
 * Type instructions that may contain references.
 */
export type ReferenceableTypeInstructionsDescription =
  InternalTypeInstructionsDescription<ReferenceableInstructions, ParameterReferenceable<BlockInstructions>>;

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
