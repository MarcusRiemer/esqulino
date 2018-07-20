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
  DefaultInstructions, Instructions, AllTypeInstructions, IteratorInstructions, BlockInstructions, TerminalInstructions, AttributeMappingMode
} from './instructions.description'

import {
  GeneratorInstructions, SingleBlockInstructions, MultiBlockInstructions
} from './instructions'

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
 * Maps properties to editable input fields.
 */
export function mapProperty(
  attr: NodePropertyTypeDescription,
  instructions: Partial<Instructions>
): VisualBlockDescriptions.EditorInput {
  return ({
    blockType: "input",
    property: attr.name
  });
};

/**
 *
 */
export function mapChildren(
  attr: NodeChildrenGroupDescription,
  instructions: IteratorInstructions
): VisualBlockDescriptions.EditorIterator {
  // Find out what goes between the elements
  let between: VisualBlockDescriptions.ConcreteBlock[] = undefined;

  // A simple seperation character?
  if (typeof instructions.between === "string" && instructions.between.length > 0) {
    // Create a single terminal character to go in between
    between = [mapTerminal(
      { type: "terminal", symbol: instructions.between },
      DefaultInstructions.terminalInstructions
    )];
  }

  // Build the actual iterator block
  const toReturn: VisualBlockDescriptions.EditorIterator = {
    blockType: "iterator",
    childGroupName: attr.name,
    direction: instructions.orientation,
  }

  // And only add between instructions if there are any
  if (between) {
    toReturn.between = between;
  }

  // Possibly add some style
  if (Object.keys(instructions.style).length > 0) {
    toReturn.style = instructions.style;
  }

  return (toReturn);
}

export function mapAttribute(
  attr: NodeAttributeDescription,
  instructions: SingleBlockInstructions,
): VisualBlockDescriptions.ConcreteBlock {
  switch (attr.type) {
    case "allowed":
    case "sequence":
    case "choice":
      return mapChildren(attr, instructions.scopeIterator(attr.name));
    case "terminal":
      return mapTerminal(attr, instructions.scopeTerminal(attr.name));
    case "property":
      return mapProperty(attr, {});
    default:
      throw new Error(`Unknown attribute type "${(attr as any).type}"`);
  }

}

/**
 * Applies the given generation instructions to each attribute
 * of the given type. If no specific instructions are available,
 * default instructions will be used.
 */
export function mapAllAttributes(
  typeDesc: NodeConcreteTypeDescription,
  instructions: SingleBlockInstructions,
): VisualBlockDescriptions.ConcreteBlock[] {
  return (typeDesc.attributes.map(attr => mapAttribute(attr, instructions)));
}

/**
 * Only generates visual blocks for types that are explicitly mentioned in the
 * instructions. No construction of blocks that haven't been mentioned.
 */
export function mapMentionedAttributes(
  typeDesc: NodeConcreteTypeDescription,
  instructions: SingleBlockInstructions,
): VisualBlockDescriptions.ConcreteBlock[] {
  return (instructions.specifiedTypes.map(t => {
    const mappedType = typeDesc.attributes.find(a => a.name === t);
    if (mappedType) {
      return (mapAttribute(mappedType, instructions));
    } else {
      throw new Error(`Could not find property "${t}" mentioned by generating instructions for "${typeDesc.type}"`);
    }
  }));
}

const attrMappers = {
  all: mapAllAttributes,
  mentioned: mapMentionedAttributes
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
    const mapFunc = attrMappers[blockInstructions.attributeMappingMode];

    // A single block
    return ([{
      blockType: "block",
      direction: blockInstructions.orientation,
      children: mapFunc(typeDesc, instructions)
    }]);
  } else if (instructions instanceof MultiBlockInstructions) {
    // Multiple blocks
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
  // these can be copied over without further ado. And some properties
  // are not filled by the generator on purpose:
  // 
  // * The `id` of the new language
  // * The default programming language
  const toReturn: BlockLanguageDocument = {
    editorBlocks: [],
    editorComponents: d.editorComponents,
    sidebars: []
  };

  // The blocks of the editor are based on the types of the grammar,
  // "oneOf" types are not of interest here because they can never
  // be nodes.
  const concreteTypes = Object.entries(g.types)
    .filter(([k, v]) => v.type !== "oneOf") as [string, NodeConcreteTypeDescription][];

  // Wrap generation instructions in something that is safe to use
  const instructions = new GeneratorInstructions(d.typeInstructions);

  // Dummy mode on: Lets create a single constant block for every type
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
  d: BlockLanguageGeneratorDescription,
  g: GrammarDescription
): BlockLanguageDescription {
  const generated = convertGrammar(d, g);

  const toReturn = Object.assign({}, l, generated);
  toReturn.blockLanguageGeneratorId = d.id;

  return (toReturn);
}
