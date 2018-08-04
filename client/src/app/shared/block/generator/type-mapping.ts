import {
  NodeConcreteTypeDescription, NodeAttributeDescription,
  NodeTerminalSymbolDescription, NodePropertyTypeDescription,
  NodeChildrenGroupDescription
} from '../../syntaxtree/grammar.description'

import { VisualBlockDescriptions } from '../block.description'

import {
  DefaultInstructions, IteratorInstructions,
  TerminalInstructions, PropertyInstructions
} from './instructions.description'

import { TypeInstructions } from './instructions'
import { isHoleIfEmpty } from '../../syntaxtree/grammar-util';

/**
 * Maps terminal symbols to constant blocks. The exact value of the terminal
 * symbol will appear as the text.
 */
export function mapTerminal(
  attr: NodeTerminalSymbolDescription,
  instructions: TerminalInstructions
): VisualBlockDescriptions.EditorConstant {
  // Build the basic block
  const toReturn: VisualBlockDescriptions.EditorConstant = {
    blockType: "constant",
    text: attr.symbol,
  };

  // Possibly add some style
  if (Object.keys(instructions.style).length > 0) {
    toReturn.style = instructions.style;
  }

  return (toReturn);
}

/**
 * Maps properties to read-only interpolated values.
 */
export function mapInterpolated(
  attr: NodePropertyTypeDescription,
  instructions: PropertyInstructions
): VisualBlockDescriptions.EditorInterpolated {
  const toReturn: VisualBlockDescriptions.EditorInterpolated = {
    blockType: "interpolated",
    property: attr.name
  };

  if (Object.keys(instructions.style).length > 0) {
    toReturn.style = instructions.style;
  }

  return (toReturn);
}

/**
 * Maps properties to editable input fields.
 */
export function mapProperty(
  attr: NodePropertyTypeDescription,
  instructions: PropertyInstructions
): VisualBlockDescriptions.EditorInput | VisualBlockDescriptions.EditorInterpolated {
  if (instructions.readOnly) {
    return (mapInterpolated(attr, instructions));
  } else {
    const toReturn: VisualBlockDescriptions.EditorInput = {
      blockType: "input",
      property: attr.name
    };

    if (Object.keys(instructions.style).length > 0) {
      toReturn.style = instructions.style;
    }

    return (toReturn);
  }
};

/**
 * Maps children of a specific child group to an iterable block.
 */
export function mapChildren(
  typeDesc: NodeConcreteTypeDescription,
  attr: NodeChildrenGroupDescription,
  instructions: IteratorInstructions
): VisualBlockDescriptions.ConcreteBlock[] {
  // Find out what goes between the elements
  let between: VisualBlockDescriptions.ConcreteBlock[] = undefined;
  let dropTarget: VisualBlockDescriptions.ConcreteBlock = undefined;

  // A simple seperation character that is explicitly specified by the instructions?
  if (typeof instructions.between === "string" && instructions.between.length > 0) {
    // Create a single terminal character to go in between
    between = [mapTerminal(
      { type: "terminal", name: "t", symbol: instructions.between },
      DefaultInstructions.terminalInstructions
    )];
  }
  // "allowed" and "sequence" may provide fallbacks in the grammar
  else if (attr.type === "allowed" || attr.type === "sequence") {
    if (attr.between) {
      between = [
        mapTerminal(attr.between, DefaultInstructions.terminalInstructions)
      ];
    }
  }

  // Find out whether to show a drop target
  if (instructions.generateDropTargets !== "none") {
    const calculatedVisibility: VisualBlockDescriptions.VisibilityExpression =
      isHoleIfEmpty(attr)
        ? { $var: "ifEmpty" }
        : { $every: [{ $var: "ifEmpty" }, { $var: "ifLegalDrag" }] };

    dropTarget = {
      blockType: "dropTarget",
      dropTarget: {
        children: {
          category: attr.name,
          order: "insertFirst"
        },
        visibility: calculatedVisibility

      },
      children: [
        {
          blockType: "constant",
          text: "❓",
          style: {
            "paddingLeft": "10px",
            "paddingRight": "10px",
            "border": "2px solid red",
            "color": "darkred",
            "backgroundColor": "orange",
            "borderRadius": "500px",
            "cursor": "default",
          },
        } as VisualBlockDescriptions.EditorConstant,
      ],
      direction: "horizontal",
    };
  }

  // Build the actual iterator block
  const iteratorBlock: VisualBlockDescriptions.EditorIterator = {
    blockType: "iterator",
    childGroupName: attr.name,
    direction: instructions.orientation,
    wrapChildren: instructions.allowWrap,
    breakAfter: instructions.breakAfter
  }

  // And only add between instructions if there are any
  if (between) {
    iteratorBlock.between = between;
  }

  // Possibly add some style
  if (Object.keys(instructions.style).length > 0) {
    iteratorBlock.style = instructions.style;
  }

  // At least the iteration block should go back
  switch (instructions.generateDropTargets) {
    case "start": return ([dropTarget, iteratorBlock]);
    case "end": return ([iteratorBlock, dropTarget]);
    case "none": return ([iteratorBlock]);
  }
}

export function mapAttribute(
  typeDesc: NodeConcreteTypeDescription,
  attr: NodeAttributeDescription,
  instructions: TypeInstructions,
): VisualBlockDescriptions.ConcreteBlock[] {
  switch (attr.type) {
    case "allowed":
    case "sequence":
    case "choice":
      return mapChildren(typeDesc, attr, instructions.scopeIterator(attr.name));
    case "terminal":
      return [mapTerminal(attr, instructions.scopeTerminal(attr.name))];
    case "property":
      return [mapProperty(attr, instructions.scopeProperty(attr.name))];
    default:
      throw new Error(`Unknown attribute type "${(attr as any).type}"`);
  }

}

/**
 * Maps attributes according to the generation instructions. This may be
 * either according to the order in the grammar or the order that is
 * given explicitly.
 */
export function mapAttributes(
  typeDesc: NodeConcreteTypeDescription,
  instructions: TypeInstructions,
  blockNumber: number,
): VisualBlockDescriptions.ConcreteBlock[] {
  // For every relevant attribute ...
  const generatedBlocks = instructions.relevantAttributes(blockNumber, typeDesc).map(t => {
    // ... find its type ...
    const mappedType = typeDesc.attributes.find(a => a.name === t);
    if (mappedType) {
      // ... and map that to one (or multiple) blocks
      return (mapAttribute(typeDesc, mappedType, instructions));
    } else {
      throw new Error(`Could not find property "${t}" mentioned by generating instructions for "${typeDesc.type}"`);
    }
  });
  // Flatten the list of lists that we got
  return (([] as VisualBlockDescriptions.ConcreteBlock[]).concat(...generatedBlocks));
}

/**
 * Concrete types are mapped to draggable blocks. Per default a single
 * block is created, but specific instructions may mandate the use
 * of multiple blocks.
 */
export function mapType(
  typeDesc: NodeConcreteTypeDescription,
  instructions: TypeInstructions,
): VisualBlockDescriptions.ConcreteBlock[] {
  const toReturn: VisualBlockDescriptions.ConcreteBlock[] = [];
  // Most types will resolve to a single block, but technically each type
  // may produce a list of blocks.
  for (let i = 0; i < instructions.numberOfBlocks; ++i) {
    const blockInstructions = instructions.scopeBlock(i);
    const thisBlock: VisualBlockDescriptions.ConcreteBlock = {
      blockType: "block",
      direction: blockInstructions.orientation,
      children: mapAttributes(typeDesc, instructions, i),
      dropTarget: blockInstructions.onDrop,
      breakAfter: blockInstructions.breakAfter,
      wrapChildren: blockInstructions.allowWrap
    };

    if (Object.keys(blockInstructions.style).length > 0) {
      thisBlock.style = blockInstructions.style;
    }

    if (blockInstructions.generateErrorIndicator !== "none") {
      let position = blockInstructions.generateErrorIndicator === "start" ? 0 : thisBlock.children.length;
      thisBlock.children.splice(position, 0, {
        blockType: "error",
        style: {
          "paddingLeft": "1ch",
          "paddingRight": "1ch",
          "background-color": "red",
          "border": "2px solid red",
          "border-radius": "500px",
          "color": "white",
          "cursor": "default",
        },
        // These errors are typically indicated by drop locations
        excludedErrors: ["MISSING_CHILD", "INVALID_MIN_OCCURENCES"]
      });
    }

    toReturn.push(thisBlock);
  }

  return (toReturn);
}
