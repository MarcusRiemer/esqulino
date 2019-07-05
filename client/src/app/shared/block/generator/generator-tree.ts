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

  // Create a visual representation for each concrete type
  const mappedNodes = Object.entries(g.types)
    .filter(([_, typeDesc]) => typeDesc.type === "concrete")
    .map(([name, typeDesc]): EditorBlockDescription => {
      return ({
        describedType: { languageName: g.technicalName, typeName: name },
        // typeDesc must be a concrete description here
        visual: [visualizeNode(d, name, typeDesc as NodeConcreteTypeDescription)]
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
    blockType: "container",
    direction: "horizontal",
    children: [
      {
        blockType: "constant",
        text: `children "${t.name}" : [`
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
    blockType: "container",
    direction: "horizontal",
    children:
      [
        {
          blockType: "constant",
          text: `prop "${t.name}": `
        },
        {
          blockType: "interpolated",
          property: t.name
        }
      ]
  });
}