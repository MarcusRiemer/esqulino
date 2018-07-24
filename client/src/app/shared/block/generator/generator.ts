import {
  GrammarDescription, NodeConcreteTypeDescription, NodeAttributeDescription,
  NodeTerminalSymbolDescription, NodePropertyTypeDescription,
  NodeChildrenGroupDescription
} from '../../syntaxtree/grammar.description'

import {
  BlockLanguageDocument, BlockLanguageListDescription, BlockLanguageDescription
} from '../block-language.description'
import {
  VisualBlockDescriptions, EditorBlockDescription
} from '../block.description'

import {
  BlockLanguageGeneratorDescription, BlockLanguageGeneratorDocument,
} from './generator.description'

import {
  DefaultInstructions, Instructions, AllTypeInstructions, IteratorInstructions,
  BlockInstructions, TerminalInstructions, PropertyInstructions
} from './instructions.description'

import {
  GeneratorInstructions, SingleBlockInstructions, MultiBlockInstructions
} from './instructions'
import { ParameterMap } from './parameters';

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
 *
 */
export function mapChildren(
  attr: NodeChildrenGroupDescription,
  instructions: IteratorInstructions
): VisualBlockDescriptions.ConcreteBlock[] {
  // Find out what goes between the elements
  let between: VisualBlockDescriptions.ConcreteBlock[] = undefined;
  let dropTarget: VisualBlockDescriptions.ConcreteBlock = undefined;

  // A simple seperation character?
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

  if (instructions.generateDropTargets !== "none") {
    dropTarget = {
      blockType: "dropTarget",
      dropTarget: {
        children: {
          category: attr.name,
          order: "insertFirst"
        },
        visibility: ["ifEmpty", "ifLegalChild"]
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
    wrapChildren: true
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
  attr: NodeAttributeDescription,
  instructions: SingleBlockInstructions,
): VisualBlockDescriptions.ConcreteBlock[] {
  switch (attr.type) {
    case "allowed":
    case "sequence":
    case "choice":
      return mapChildren(attr, instructions.scopeIterator(attr.name));
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
  instructions: SingleBlockInstructions,
): VisualBlockDescriptions.ConcreteBlock[] {
  // For every relevant attribute ...
  const generatedBlocks = instructions.relevantAttributes(typeDesc).map(t => {
    // ... find its type ...
    const mappedType = typeDesc.attributes.find(a => a.name === t);
    if (mappedType) {
      // ... and map that to one (or multiple) blocks
      return (mapAttribute(mappedType, instructions));
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
  instructions: SingleBlockInstructions | MultiBlockInstructions,
): VisualBlockDescriptions.ConcreteBlock[] {
  // How many blocks should be created?
  if (instructions instanceof SingleBlockInstructions) {
    const blockInstructions = instructions.scopeBlock();
    const toReturn: VisualBlockDescriptions.ConcreteBlock = {
      blockType: "block",
      direction: blockInstructions.orientation,
      children: mapAttributes(typeDesc, instructions),
      dropTarget: blockInstructions.onDrop,
    };

    if (Object.keys(blockInstructions.style).length > 0) {
      toReturn.style = blockInstructions.style;
    }

    // A single block
    return ([toReturn]);
  } else if (instructions instanceof MultiBlockInstructions) {
    // Multiple blocks can be treated as a series of single blocks
    const arrayOfArray = instructions.blocks.map(single => mapType(typeDesc, single));
    return ([].concat(...arrayOfArray));
  } else {
    // Shouldn't ever happen
    throw new Error(`Neither single nor multiple block instructions`);
  }

}

/**
 * Takes a grammar description and a description how to transform it and
 * generates the corresponding block language.
 */
export function convertGrammar(
  d: BlockLanguageGeneratorDocument,
  g: GrammarDescription
): BlockLanguageDocument {
  // Some information is provided 1:1 by the generation instructions,
  // these can be copied over without further ado.
  const toReturn: BlockLanguageDocument = {
    editorBlocks: [],
    editorComponents: d.editorComponents || [],
    sidebars: d.staticSidebars || []
  };

  // The blocks of the editor are based on the concrete types of the grammar,
  // "oneOf" types are not of interest here because they can never be nodes.
  const concreteTypes = Object.entries(g.types)
    .filter(([k, v]) => v.type !== "oneOf") as [string, NodeConcreteTypeDescription][];

  // Grab the parameters and the values this generator defines
  const parameters = new ParameterMap();

  // The type instructions may contain references. The parameter map from the
  // previous step contains all values that these references may be resolved to.
  const resolvedTypeInstructions = parameters.resolve(d.typeInstructions);

  // Wrap self contained instruction description in something that allows safe
  // access no matter whether the seeked value exists or not.
  const instructions = new GeneratorInstructions(resolvedTypeInstructions);

  // Look over every type that exists and see how it should be created
  toReturn.editorBlocks = concreteTypes.map(([tName, tDesc]): EditorBlockDescription => {
    return ({
      describedType: {
        languageName: g.name,
        typeName: tName
      },
      visual: mapType(tDesc, instructions.typeInstructions(g.name, tName))
    });
  });

  return (toReturn);
}

/**
 * Takes a whole block language and overwrites document properties that can
 * be re-generated by automatic conversion.
 */
export function generateBlockLanguage(
  l: BlockLanguageListDescription,
  d: BlockLanguageGeneratorDocument,
  g: GrammarDescription
): BlockLanguageDescription {
  const generated = convertGrammar(d, g);

  const toReturn = Object.assign({}, l, generated);

  return (toReturn);
}
