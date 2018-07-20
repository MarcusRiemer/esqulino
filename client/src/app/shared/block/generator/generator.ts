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
  DefaultInstructions, Instructions, TypeInstructions, LayoutInstructions, BlockInstructions, TerminalInstructions
} from './generator.description'

import {
  SafeGeneratorInstructions, SafeTypeInstructions
} from './generator-instructions'

/**
 * Maps terminal symbols to constant blocks. The exact value of the terminal
 * symbol will appear as the text.
 */
function mapTerminal(
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
function mapProperty(attr: NodePropertyTypeDescription): VisualBlockDescriptions.EditorInput {
  return ({
    blockType: "input",
    property: attr.name
  });
};

/**
 *
 */
function mapChildren(
  attr: NodeChildrenGroupDescription,
  instructions: LayoutInstructions
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

/**
 * Applies the given generation instructions to each attribute
 * of the given type.
 */
function mapAttributes(
  typeDesc: NodeConcreteTypeDescription,
  instructions: SafeTypeInstructions,
): VisualBlockDescriptions.ConcreteBlock[] {
  return (
    typeDesc.attributes
      .map(attr => {
        switch (attr.type) {
          case "allowed":
          case "sequence":
          case "choice":
            return mapChildren(attr, instructions.scopeLayout(attr.name));
          case "terminal":
            return mapTerminal(attr, instructions.scopeTerminal(attr.name));
          case "property":
            return mapProperty(attr);
          default:
            return (undefined);
        }
      })
      // Scrub everything that couldn't be created
      .filter(visual => !!visual)
  );
}

/**
 * Concrete types are mapped to draggable blocks.
 */
function mapType(
  typeDesc: NodeConcreteTypeDescription,
  instructions: SafeTypeInstructions,
): VisualBlockDescriptions.EditorBlock {
  // Create a 
  return ({
    blockType: "block",
    direction: instructions.scopeBlock().orientation,
    children: mapAttributes(typeDesc, instructions)
  });
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
  const instructions = new SafeGeneratorInstructions(d.typeInstructions);

  // Dummy mode on: Lets create a single constant block for every type
  toReturn.editorBlocks = concreteTypes.map(([tName, tDesc]): EditorBlockDescription => {
    return ({
      describedType: {
        languageName: g.name,
        typeName: tName
      },
      visual: [mapType(tDesc, instructions.type(g.name, tName))]
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
