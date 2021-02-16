import { BlattWerkzeugError } from "../blattwerkzeug-error";
import { CodeGeneratorProcess } from "./codegenerator";
import { stableQualifiedTypename } from "./grammar-type-util";
import {
  NamedLanguages,
  NodeConcreteTypeDescription,
  NodeTerminalSymbolDescription,
  NodeVisualTypeDescription,
  VisualisedLanguages,
} from "./grammar.description";
import { Node } from "./syntaxtree";

export class AutomaticCodeGenerationError extends BlattWerkzeugError {
  public constructor(node: Node, message?: string) {
    super(
      stableQualifiedTypename(node) +
        " at " +
        JSON.stringify(node.location) +
        ": " +
        message
    );
  }
}

function codeGenType(
  types: NamedLanguages | VisualisedLanguages,
  node: Node
):
  | NodeConcreteTypeDescription
  | NodeVisualTypeDescription
  | AutomaticCodeGenerationError {
  const t = types[node.languageName]?.[node.typeName];

  // Ensure that the node is backed by this grammar
  if (!t) {
    return new AutomaticCodeGenerationError(node, `has no type information`);
  }

  // Ensure that there is no impossible node in the tree
  if (t.type === "oneOf") {
    return new AutomaticCodeGenerationError(node, `is "oneOf" type`);
  }

  return t;
}

export function isCodeGenType(
  types: NamedLanguages | VisualisedLanguages,
  node: Node
): boolean {
  const r = codeGenType(types, node);
  return !(r instanceof AutomaticCodeGenerationError);
}

export function ensureCodeGenType(
  types: NamedLanguages | VisualisedLanguages,
  node: Node
) {
  const r = codeGenType(types, node);
  if (r instanceof AutomaticCodeGenerationError) {
    throw r;
  } else {
    return r;
  }
}

function convertTerminal(
  t: NodeTerminalSymbolDescription,
  node: Node,
  process: CodeGeneratorProcess<any>
) {
  process.addConvertedFragment(t.symbol, node);
}

/**
 * Generate a fragment for the given node based on the type or visualisation
 * definitions for the current node.
 *
 * @param types The types that are the basis for code generation
 * @param node  The node to process
 * @param process The current code generation process
 */
export function codeGeneratorFromGrammar(
  types: NamedLanguages | VisualisedLanguages,
  node: Node,
  process: CodeGeneratorProcess<any>
) {
  const t = ensureCodeGenType(types, node);

  t.attributes.forEach((a) => {
    switch (a.type) {
      case "terminal": {
        convertTerminal(a, node, process);
        break;
      }
      case "property": {
        const val = node.properties[a.name];
        process.addConvertedFragment(val, node);
        break;
      }
      case "allowed":
      case "sequence":
      case "container":
      case "parentheses": {
        const children = node.getChildrenInCategory(a.name);
        const between = "between" in a ? a.between : undefined;
        children.forEach((c, i) => {
          process.generateNode(c);
          if (i > 0 && between) {
            convertTerminal(between, node, process);
          }
        });
        break;
      }
    }
  });
}
