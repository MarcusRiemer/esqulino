import { CodeResourceDescription } from "./coderesource.description";
import { NodeDescription } from "./syntaxtree.description";

/**
 * Figures out how a certain code resource should be dragged.
 * It would probably be nicer
 */
export function tailorResourceReferences(
  c: CodeResourceDescription
): NodeDescription[] {
  const possibleNodes: NodeDescription[] = [];

  if (c.programmingLanguageId === "truck-world") {
    possibleNodes.push({
      language: "trucklino_program",
      name: "refWorld",
      properties: {
        worldId: c.id,
      },
    });
  }

  return possibleNodes;
}
