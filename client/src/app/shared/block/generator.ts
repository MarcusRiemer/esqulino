import {
  GrammarDescription, NodeConcreteTypeDescription, NodeAttributeDescription,
  NodeTerminalSymbolDescription, NodePropertyTypeDescription,
  NodeChildrenGroupDescription
} from '../syntaxtree/grammar.description'


import {
  BlockLanguageDocument, BlockLanguageListDescription, BlockLanguageDescription
} from './block-language.description'
import {
  VisualBlockDescriptions
} from './block.description'
import {
  BlockLanguageGeneratorDescription, BlockLanguageGeneratorDocument
} from './generator.description'
import { EditorBlockDescription } from './block.description'

/**
 * Maps terminal symbols to visual blocks
 */
function mapTerminal(attr: NodeTerminalSymbolDescription): VisualBlockDescriptions.EditorConstant {
  return ({
    blockType: "constant",
    text: attr.symbol
  });
}

function mapProperty(attr: NodePropertyTypeDescription): VisualBlockDescriptions.EditorInput {
  return ({
    blockType: "input",
    property: attr.name
  });
};

function mapChildren(attr: NodeChildrenGroupDescription): VisualBlockDescriptions.EditorIterator {
  return ({
    blockType: "iterator",
    childGroupName: attr.name,
    direction: "horizontal"
  });
}

/**
 * Calculates a bare bones, but hopefully useful, series of visual blocks for the
 * given attributes.
 */
function mapAttributes(attributes: NodeAttributeDescription[]): VisualBlockDescriptions.ConcreteBlock[] {
  return (
    attributes
      .map(attr => {
        switch (attr.type) {
          case "allowed":
          case "sequence":
            return mapChildren(attr);
          case "terminal":
            return mapTerminal(attr);
          case "property":
            return mapProperty(attr);
          default:
            return (undefined);
        }
      })
      .filter(visual => !!visual)
  );
}

function mapType(typeDesc: NodeConcreteTypeDescription): VisualBlockDescriptions.EditorBlock {
  return ({
    blockType: "block",
    direction: "horizontal",
    children: mapAttributes(typeDesc.attributes)
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

  // Dummy mode on: Lets create a single constant block for every type
  toReturn.editorBlocks = concreteTypes.map(([tName, tDesc]): EditorBlockDescription => {
    return ({
      describedType: {
        languageName: g.name,
        typeName: tName
      },
      visual: [mapType(tDesc)]
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
