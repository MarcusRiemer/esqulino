import { VisualBlockDescriptions } from "../block.description";
import { ParameterReferenceable } from "./parameters.description";

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
  // Used to separate iterated elements
  between: string;
  // Defines the order in which the attributes appear
  attributeMapping: AttributeMappingOrder;
  // General CSS styling instructions
  style: { [attribute: string]: string };
  // Controls how things dropped on this block will be treated
  onDrop: DropTargetProperties;
  // Where (and if) to generate error indicators
  generateErrorIndicator: Position;
  // Should the drop marker be shown, even if it is valid without children?
  emptyDropTarget: boolean;
  // Some properties are not meant to be edited.
  propReadOnly: boolean;
}

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
export type IteratorInstructions = Readonly<
  Pick<Instructions, "between" | "style" | "emptyDropTarget">
>;

/**
 * Instructions that are useful on a block visual.
 */
export type BlockInstructions = Readonly<
  Pick<
    Instructions,
    "attributeMapping" | "style" | "onDrop" | "generateErrorIndicator"
  >
>;

/**
 * Instructions that are useful on a terminal visual.
 */
export type TerminalInstructions = Readonly<Pick<Instructions, "style">>;

/**
 * Instructions that are useful on a property.
 */
export type PropertyInstructions = Readonly<
  Pick<Instructions, "style" | "propReadOnly">
>;

/**
 * Default options for the various types of blocks
 */
export module DefaultInstructions {
  export const iteratorInstructions: IteratorInstructions = {
    between: undefined,
    style: {},
    emptyDropTarget: false,
  };

  export const blockInstructions: BlockInstructions = {
    attributeMapping: "grammar",
    style: {},
    onDrop: VisualBlockDescriptions.DefaultDropTargetProperties,
    generateErrorIndicator: "start",
  };

  export const terminalInstructions: TerminalInstructions = {
    style: {
      display: "inline-flex",
    },
  };

  export const propertyInstructions: PropertyInstructions = {
    propReadOnly: false,
    style: {
      display: "inline-flex",
    },
  };
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
    [scope: string]: Partial<TAttr>;
  };
}

/**
 * Fully resolved type instructions.
 */
export type TypeInstructionsDescription = InternalTypeInstructionsDescription<
  Instructions,
  BlockInstructions
>;

/**
 * Type instructions that may contain references.
 */
export type ReferenceableTypeInstructionsDescription = InternalTypeInstructionsDescription<
  ReferenceableInstructions,
  ParameterReferenceable<BlockInstructions>
>;

/**
 * Supplementary generation instructions for all types. In this variant
 * all instructions are guarenteed to be resolved, there are no references
 * anywhere.
 */
export type AllTypeInstructions = {
  [language: string]: {
    [type: string]: TypeInstructionsDescription;
  };
};

/**
 * Supplementary generation instructions for all types. In this variant
 * there may be references to exact values instead of the exact values
 * themselves.
 */
export type AllReferenceableTypeInstructions = {
  [language: string]: {
    [type: string]: ReferenceableTypeInstructionsDescription;
  };
};
