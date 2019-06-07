import { generateSidebar } from './sidebar';
import { TreeBlockLanguageGeneratorDescription } from './generator.description';
import { defaultEditorComponents } from './generator-default';

import { BlockLanguageDocument } from '../block-language.description';
import { VisualBlockDescriptions, EditorBlockDescription } from '../block.description';

import { GrammarDocument, NodeConcreteTypeDescription, NodeTypeDescription, NodeOneOfTypeDescription, NodeAttributeDescription, NodePropertyTypeDescription, NodeChildrenGroupDescription } from '../../syntaxtree';
import { __assign } from 'tslib';


/**
 * Takes a grammar description and a description how to transform it and
 * generates the corresponding block language.
 */
export function convertGrammarTreeInstructions(
  d: TreeBlockLanguageGeneratorDescription,
  g: GrammarDocument
): BlockLanguageDocument {
  // Some information is provided 1:1 by the generation instructions,
  // these can be copied over without further ado.
  const toReturn: BlockLanguageDocument = {
    editorBlocks: [],
    editorComponents: d.editorComponents || defaultEditorComponents,
    sidebars: (d.staticSidebars || []).map(sidebar => generateSidebar(g, sidebar))
  };

  // Calls appropriate function dependending on the type
  const mapTypeDescription = (name: string, typeDesc: NodeTypeDescription) => {
    switch (typeDesc.type) {
      case "concrete": return convertNode(d, name, typeDesc);
      case "oneOf": return convertOneOf(d, name, typeDesc);
    }
  };

  // Create a visual representation for each type
  const mappedNodes = Object.entries(g.types).map(([name, typeDesc]): EditorBlockDescription => {
    return ({
      describedType: { languageName: g.technicalName, typeName: name },
      visual: [mapTypeDescription(name, typeDesc)]
    });
  });

  toReturn.editorBlocks = mappedNodes;

  return (toReturn);
}

/**
 * Converts this whole node (and its attributes) to a JSON-inspired representation.
 */
export function convertNode(
  d: TreeBlockLanguageGeneratorDescription,
  name: string,
  t: NodeConcreteTypeDescription,
): VisualBlockDescriptions.ConcreteBlock {
  const attributes = t.attributes.map(a => convertNodeAttribute(d, a));

  return ({
    blockType: "block",
    direction: "horizontal",
    children: [
      { blockType: "constant", text: name },
      { blockType: "constant", text: "{" },
      ...attributes,
      { blockType: "constant", text: "}" }
    ]
  });
}

export function convertNodeAttribute(
  d: TreeBlockLanguageGeneratorDescription,
  t: NodeAttributeDescription
): VisualBlockDescriptions.ConcreteBlock {
  switch (t.type) {
    case "property":
      return convertProperty(d, t);
    case "sequence":
    case "allowed":
      return convertChildGroup(d, t);
  }
}

export function convertChildGroup(
  d: TreeBlockLanguageGeneratorDescription,
  t: NodeChildrenGroupDescription
): VisualBlockDescriptions.ConcreteBlock {

  return ({
    blockType: "block",
    direction: "horizontal",
    children: [
      {
        blockType: "constant",
        text: t.type
      },
      {
        blockType: "constant",
        text: " "
      },
      {
        blockType: "constant",
        text: t.name
      }
    ]
  });
}

export function convertProperty(
  d: TreeBlockLanguageGeneratorDescription,
  t: NodePropertyTypeDescription
): VisualBlockDescriptions.ConcreteBlock {

  const optional: VisualBlockDescriptions.EditorConstant[]
    = t.isOptional ? [{ blockType: "constant", text: "?" }] : [];

  return ({
    blockType: "block",
    direction: "horizontal",
    children: [
      {
        blockType: "constant",
        text: "prop "
      },
      {
        blockType: "constant",
        text: t.name
      },
      ...optional,
      {
        blockType: "constant",
        text: " {"
      },
      {
        blockType: "constant",
        text: t.base
      },
      {
        blockType: "constant",
        text: "}"
      }
    ]
  });
}

export function convertOneOf(
  d: TreeBlockLanguageGeneratorDescription,
  name: string,
  t: NodeOneOfTypeDescription
): VisualBlockDescriptions.ConcreteBlock {
  return ({
    blockType: "block",
    direction: "horizontal",
    children: [
      { blockType: "constant", text: name },
      { blockType: "constant", text: "::=" }
    ]
  });
}
