import { generateSidebar } from './sidebar';
import { TreeBlockLanguageGeneratorDescription } from './generator.description';
import { defaultEditorComponents } from './generator-default';

import { BlockLanguageDocument } from '../block-language.description';
import { VisualBlockDescriptions, EditorBlockDescription } from '../block.description';

import { GrammarDocument, NodeConcreteTypeDescription, NodeTypeDescription, NodeOneOfTypeDescription, NodeAttributeDescription, NodePropertyTypeDescription, NodeChildrenGroupDescription } from '../../syntaxtree';


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

  // Convert each node that is mentioned in the grammar to its own appropriate
  // block description.
  const mapTypeDescription = (name: string, typeDesc: NodeTypeDescription) => {
    switch (typeDesc.type) {
      case "concrete": return visualizeNode(d, name, typeDesc);
      case "oneOf": return visualizeOneOf(d, name, typeDesc);
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
export function visualizeNode(
  d: TreeBlockLanguageGeneratorDescription,
  name: string,
  t: NodeConcreteTypeDescription,
): VisualBlockDescriptions.ConcreteBlock {
  const attributes = t.attributes.map(a => visualizeNodeAttributes(d, a));

  return ({
    blockType: "block",
    direction: "vertical",
    children: [
      { blockType: "constant", text: `node "${name}" {` },
      ...attributes,
      { blockType: "constant", text: "}" }
    ]
  });
}

export function visualizeNodeAttributes(
  d: TreeBlockLanguageGeneratorDescription,
  t: NodeAttributeDescription
): VisualBlockDescriptions.ConcreteBlock {
  switch (t.type) {
    case "property":
      return visualizeProperty(d, t);
    case "sequence":
    case "allowed":
      return visualizeChildGroup(d, t);
  }
}

export function visualizeChildGroup(
  d: TreeBlockLanguageGeneratorDescription,
  t: NodeChildrenGroupDescription
): VisualBlockDescriptions.ConcreteBlock {

  return ({
    blockType: "block",
    direction: "vertical",
    breakAfter: true,
    children: [
      {
        blockType: "constant",
        text: `${t.name} : [`
      },
      {
        blockType: "iterator",
        childGroupName: t.name,
        direction: "vertical"
      },
      {
        blockType: "constant",
        text: `]`
      },
    ]
  });
}

export function visualizeProperty(
  d: TreeBlockLanguageGeneratorDescription,
  t: NodePropertyTypeDescription
): VisualBlockDescriptions.ConcreteBlock {
  return ({
    blockType: "block",
    direction: "horizontal",
    children: [
      {
        blockType: "constant",
        text: `prop ${t.name}: `
      },
      {
        blockType: "interpolated",
        property: t.name
      }
    ]
  });
}

export function visualizeOneOf(
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
