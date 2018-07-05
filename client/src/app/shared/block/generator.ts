import {
  GrammarDescription, NodeConcreteTypeDescription
} from '../syntaxtree/grammar.description'

import { BlockLanguageGeneratorDescription } from './generator.description'
import { BlockLanguageDescription } from './block-language.description'
import { EditorBlockDescription } from './block.description'

/**
 * Takes a grammar description and a description how to transform it and
 * generates the corresponding block language.
 */
export function convert(
  d: BlockLanguageGeneratorDescription,
  g: GrammarDescription
): BlockLanguageDescription {
  // Some information is provided 1:1 by the generation instructions,
  // these can be copied over without further ado
  const toReturn: BlockLanguageDescription = {
    name: d.targetName,
    id: undefined,
    defaultProgrammingLanguageId: d.targetProgrammingLanguage,
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
      visual: [
        {
          blockType: "constant",
          text: tName
        }
      ]
    });
  });

  return (toReturn);
}
