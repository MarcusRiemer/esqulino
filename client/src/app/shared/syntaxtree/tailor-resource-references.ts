import { first } from "rxjs/operators";

import { GrammarGeneratedByGQL } from "../../../generated/graphql";

import { CodeResourceDescription } from "./coderesource.description";
import { NodeDescription } from "./syntaxtree.description";

/**
 * Figures out how a certain code resource should be dragged.
 * It would probably be nicer
 */
export async function tailorResourceReferences(
  c: CodeResourceDescription,
  grammarGeneratedBy: GrammarGeneratedByGQL
): Promise<NodeDescription[]> {
  const possibleNodes: NodeDescription[] = [];

  // References to truck worlds are only used by Trucklino
  if (c.programmingLanguageId === "truck-world") {
    possibleNodes.push({
      language: "trucklino_program",
      name: "refWorld",
      properties: {
        worldId: c.id,
      },
    });
  }

  if (c.programmingLanguageId === "meta-grammar") {
    const generatedGrammars = await grammarGeneratedBy
      .fetch({ codeResourceId: c.id })
      .pipe(first())
      .toPromise();

    const nodes = generatedGrammars.data.grammars?.nodes;
    if (nodes.length === 1) {
      const chosenGrammar = nodes[0];

      possibleNodes.push({
        language: "MetaGrammar",
        name: "grammarRef",
        properties: {
          grammarId: chosenGrammar.id,
        },
      });
    }
  }

  return possibleNodes;
}
