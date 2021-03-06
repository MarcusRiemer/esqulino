import {
  NodeConcreteTypeDescription,
  NodeAttributeDescription,
  NodeTerminalSymbolDescription,
  NodePropertyTypeDescription,
  NodeChildrenGroupDescription,
  NodeVisualContainerDescription,
  NodeInterpolatePropertyDescription,
  NodeVisualTypeDescription,
  NodeInterpolateChildrenDescription,
} from "../../syntaxtree/grammar.description";

import { VisualBlockDescriptions } from "../block.description";

import {
  DefaultInstructions,
  IteratorInstructions,
  TerminalInstructions,
  PropertyInstructions,
} from "./instructions.description";

import { TypeInstructions } from "./instructions";

type MappedNodeType = NodeConcreteTypeDescription | NodeVisualTypeDescription;

/**
 * Checks whether the given attributes have any tags assigned. If that is the case
 * they are immediatly added to the visual representation.
 */
function addTags(
  attr: NodeAttributeDescription,
  visual: VisualBlockDescriptions.ConcreteBlock
) {
  if (attr.tags?.length > 0) {
    const prev = visual.cssClasses ?? [];
    visual.cssClasses = [...prev, ...attr.tags];
  }
}

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

  // Possibly add some class
  addTags(attr, toReturn);

  return toReturn;
}

/**
 * Maps properties to read-only interpolated values.
 */
export function mapInterpolated(
  attr: NodePropertyTypeDescription | NodeInterpolatePropertyDescription,
  instructions: TerminalInstructions
): VisualBlockDescriptions.EditorInterpolated {
  const toReturn: VisualBlockDescriptions.EditorInterpolated = {
    blockType: "interpolated",
    property: attr.name,
  };

  if (Object.keys(instructions.style).length > 0) {
    toReturn.style = instructions.style;
  }

  // Possibly add some class
  addTags(attr, toReturn);

  return toReturn;
}

/**
 * Maps properties to editable input fields.
 */
export function mapProperty(
  attr: NodePropertyTypeDescription,
  instructions: PropertyInstructions
):
  | VisualBlockDescriptions.EditorInput
  | VisualBlockDescriptions.EditorInterpolated {
  if (instructions.propReadOnly) {
    // If the instructions demand this value to be read only: Treat it as an interpolated value
    return mapInterpolated(attr, instructions);
  } else {
    // Otherwise generate an input field
    const toReturn: VisualBlockDescriptions.EditorInput = {
      blockType: "input",
      property: attr.name,
    };

    if (Object.keys(instructions.style).length > 0) {
      toReturn.style = instructions.style;
    }

    addTags(attr, toReturn);

    return toReturn;
  }
}

/**
 * Maps children of a specific child group to an iterable block.
 */
export function mapChildren(
  _typeDesc: MappedNodeType,
  attr: NodeChildrenGroupDescription | NodeInterpolateChildrenDescription,
  instructions: IteratorInstructions
): VisualBlockDescriptions.ConcreteBlock[] {
  // Find out what goes between the elements
  let between: VisualBlockDescriptions.ConcreteBlock[] = undefined;

  // The grammar may have defined a seperation character
  if (
    attr.type === "parentheses" ||
    attr.type === "allowed" ||
    attr.type === "sequence" ||
    attr.type === "each"
  ) {
    if (attr.between) {
      between = [
        mapTerminal(attr.between, DefaultInstructions.terminalInstructions),
      ];
    }
  }

  // A simple separation character that is explicitly specified by the instructions?
  if (
    typeof instructions.between === "string" &&
    instructions.between.length > 0
  ) {
    // Create a single terminal character to go in between
    between = [
      mapTerminal(
        { type: "terminal", name: "t", symbol: instructions.between },
        DefaultInstructions.terminalInstructions
      ),
    ];
  }
  // Complex type may provide fallbacks in the grammar
  else if (
    attr.type === "allowed" ||
    attr.type === "sequence" ||
    attr.type === "each"
  ) {
    if (attr.between) {
      between = [
        mapTerminal(attr.between, DefaultInstructions.terminalInstructions),
      ];
    }
  }

  // Build the actual iterator block
  const iteratorBlock: VisualBlockDescriptions.EditorIterator = {
    blockType: "iterator",
    childGroupName: attr.name,
    // Is this a soft hole according to the tags or the traits?
    emptyDropTarget:
      instructions.emptyDropTarget || (attr.tags ?? []).includes("soft-hole"),
  };

  // And only add between instructions if there are any
  if (between) {
    iteratorBlock.between = between;
  }

  // Possibly add some style
  if (Object.keys(instructions.style).length > 0) {
    iteratorBlock.style = instructions.style;
  }

  // Possibly add the tags
  addTags(attr, iteratorBlock);

  return [iteratorBlock];
}

export function mapContainer(
  _typeDesc: MappedNodeType,
  attr: NodeVisualContainerDescription,
  instructions: TypeInstructions
): VisualBlockDescriptions.ConcreteBlock {
  const mappedChildren: VisualBlockDescriptions.ConcreteBlock[][] =
    attr.children.map((a) => mapAttribute(_typeDesc, a, instructions));

  const toReturn: VisualBlockDescriptions.EditorContainer = {
    blockType: "container",
    children: [].concat(...mappedChildren),
    orientation: attr.orientation,
  };

  // Possibly add some class
  addTags(attr, toReturn);

  return toReturn;
}

export function mapAttribute(
  typeDesc: MappedNodeType,
  attr: NodeAttributeDescription,
  instructions: TypeInstructions
): VisualBlockDescriptions.ConcreteBlock[] {
  switch (attr.type) {
    case "allowed":
    case "sequence":
    case "choice":
    case "parentheses":
    case "each":
      return mapChildren(typeDesc, attr, instructions.scopeIterator(attr.name));
    case "property":
      return [mapProperty(attr, instructions.scopeProperty(attr.name))];
    case "interpolate":
      return [mapInterpolated(attr, instructions.scopeProperty(attr.name))];
    case "terminal":
      return [mapTerminal(attr, instructions.scopeTerminal(attr.name))];
    case "container":
      return [mapContainer(typeDesc, attr, instructions)];
    default:
      throw new Error(`Unknown attribute type "${(attr as any).type}"`);
  }
}

/**
 * Maps attributes according to the generation instructions. This may be
 * either according to the order in the grammar or the order that is
 * given explicitly.
 */
export function mapBlockAttributes(
  typeDesc: MappedNodeType,
  instructions: TypeInstructions,
  blockNumber: number
): VisualBlockDescriptions.ConcreteBlock[] {
  // For every relevant attribute ...
  const generatedBlocks = instructions
    .relevantAttributes(blockNumber, typeDesc)
    .map((t) => {
      // ... find its type ...
      const mappedType = typeDesc.attributes.find((a) => a.name === t);
      if (mappedType) {
        // ... and map that to one (or multiple) blocks
        return mapAttribute(typeDesc, mappedType, instructions);
      } else {
        throw new Error(
          `Could not find property "${t}" mentioned by generating instructions for "${typeDesc.type}"`
        );
      }
    });
  // Flatten the list of lists that we got
  return ([] as VisualBlockDescriptions.ConcreteBlock[]).concat(
    ...generatedBlocks
  );
}

/**
 * Concrete types are mapped to draggable blocks. Per default a single
 * block is created, but specific instructions may mandate the use
 * of multiple blocks.
 */
export function mapType(
  typeDesc: MappedNodeType,
  instructions: TypeInstructions
): VisualBlockDescriptions.ConcreteBlock[] {
  const toReturn: VisualBlockDescriptions.ConcreteBlock[] = [];
  // Most types will resolve to a single block, but technically each type
  // may produce a list of blocks.
  for (let i = 0; i < instructions.numberOfBlocks; ++i) {
    const blockInstructions = instructions.scopeBlock(i);
    const thisBlock: VisualBlockDescriptions.ConcreteBlock = {
      blockType: "block",
      children: mapBlockAttributes(typeDesc, instructions, i),
      dropTarget: blockInstructions.onDrop,
    };

    if (Object.keys(blockInstructions.style).length > 0) {
      thisBlock.style = blockInstructions.style;
    }

    if (blockInstructions.generateErrorIndicator !== "none") {
      let position =
        blockInstructions.generateErrorIndicator === "start"
          ? 0
          : thisBlock.children.length;
      thisBlock.children.splice(position, 0, {
        blockType: "error",
        style: {
          paddingLeft: "1ch",
          paddingRight: "1ch",
          "background-color": "red",
          border: "2px solid red",
          "border-radius": "500px",
          color: "white",
          cursor: "default",
        },
        // These errors are typically indicated by drop locations
        excludedErrors: ["MISSING_CHILD", "INVALID_MIN_OCCURENCES"],
      });
    }

    toReturn.push(thisBlock);
  }

  return toReturn;
}
