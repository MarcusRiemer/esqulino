import { BlattWerkzeugError } from "../blattwerkzeug-error";
import { CodeGeneratorProcess, OutputSeparator } from "./codegenerator-process";
import { stableQualifiedTypename } from "./grammar-type-util";
import {
  NamedLanguages,
  NodeAttributeDescription,
  NodeConcreteTypeDescription,
  NodeInterpolatePropertyDescription,
  NodePropertyTypeDescription,
  NodeTerminalSymbolDescription,
  NodeVisualTypeDescription,
  VisualisedLanguages,
} from "./grammar.description";
import { SyntaxNode } from "./syntaxtree";

/**
 * Errors that occur during automatic code generation.
 */
export class AutomaticCodeGenerationError extends BlattWerkzeugError {
  public constructor(node: SyntaxNode, message?: string) {
    super(
      stableQualifiedTypename(node) +
        " at " +
        JSON.stringify(node.location) +
        ": " +
        message
    );
  }
}

/**
 * Internal function to deliver either an exception or the request type. Used
 * by a predicate and an assertion function.
 */
function codeGenType(
  types: NamedLanguages | VisualisedLanguages,
  node: SyntaxNode
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
  node: SyntaxNode
): boolean {
  const r = codeGenType(types, node);
  return !(r instanceof AutomaticCodeGenerationError);
}

export function ensureCodeGenType(
  types: NamedLanguages | VisualisedLanguages,
  node: SyntaxNode
) {
  const r = codeGenType(types, node);
  if (r instanceof AutomaticCodeGenerationError) {
    throw r;
  } else {
    return r;
  }
}

/**
 * Various things may specify that the require indentation. This helper
 * method wraps the given action to be indented if needed.
 */
function possiblyIndent(
  entity: { tags?: string[] },
  process: CodeGeneratorProcess<any>,
  action: () => void
) {
  if (entity.tags?.includes("indent")) {
    process.indent(action);
  } else {
    action();
  }
}

const SEPARATOR_TAGS = new Set([
  "newline-after",
  "newline-before",
  "space-after",
  "space-before",
  "space-around",
]);
function tagToSeparator(node: SyntaxNode, tags?: string[]): OutputSeparator {
  const separatorTags = (tags ?? []).filter((t) => SEPARATOR_TAGS.has(t));

  if (separatorTags.length > 1) {
    throw new AutomaticCodeGenerationError(
      node,
      "has multiple separator tags: " + separatorTags.join(", ")
    );
  } else if (separatorTags.length === 0) {
    return OutputSeparator.NONE;
  } else {
    const single = separatorTags[0];
    switch (single) {
      case "newline-after":
        return OutputSeparator.NEW_LINE_AFTER;
      case "newline-before":
        return OutputSeparator.NEW_LINE_BEFORE;
      case "space-after":
        return OutputSeparator.SPACE_AFTER;
      case "space-before":
        return OutputSeparator.SPACE_BEFORE;
      case "space-around":
        return OutputSeparator.SPACE_BEFORE | OutputSeparator.SPACE_AFTER;
    }
  }
}

/**
 * May return the quoted value if there are tags demanding this.
 */
function valueToPossiblyQuote(value: string, tags?: string[]): string {
  if ((tags ?? []).includes("double-quote")) {
    return `"${value}"`;
  } else {
    return value;
  }
}

/**
 * Converts a terminal, with respect to all tags that may affect a terminal.
 *
 * @param newLine Used for separators
 */
function convertTerminal(
  t:
    | NodeTerminalSymbolDescription
    | NodeInterpolatePropertyDescription
    | NodePropertyTypeDescription,
  node: SyntaxNode,
  process: CodeGeneratorProcess<any>,
  newLine = false
) {
  const val = t.type === "terminal" ? t.symbol : node.properties[t.name];

  const sep = newLine
    ? OutputSeparator.NEW_LINE_AFTER
    : tagToSeparator(node, t.tags);
  process.addConvertedFragment(valueToPossiblyQuote(val, t.tags), node, sep);
}

/**
 * Process a list of attributes as if they belong to the given node.
 * This is part of a recursive process that is required for containers:
 * These may define a new attribute list on the same node.
 */
function processAttributes(
  attributes: NodeAttributeDescription[],
  types: NamedLanguages | VisualisedLanguages,
  node: SyntaxNode,
  process: CodeGeneratorProcess<any>,
  parentOrientation: "horizontal" | "vertical"
) {
  // Breaks after the given action if the action has lead to some
  // kind of emitted code.
  const possiblyBreakAfter = (action: () => void) => {
    const changes = process.trackChanges(action);
    if (changes.length > 0 && parentOrientation === "vertical") {
      const lastChange = changes[changes.length - 1];
      if ((lastChange.sep & OutputSeparator.NEW_LINE_AFTER) === 0) {
        process.addConvertedFragment("", node, OutputSeparator.NEW_LINE_AFTER);
      }
    }
  };

  attributes.forEach((a) => {
    switch (a.type) {
      // Are converted by directly printing out some strings
      case "terminal":
      case "property":
      case "interpolate": {
        possiblyBreakAfter(() => {
          convertTerminal(a, node, process);
        });
        break;
      }

      // All of the following types have child nodes which will be delegated
      // to the running emit process
      case "allowed":
      case "sequence":
      case "parentheses":
      case "each": {
        const children = node.getChildrenInCategory(a.name);
        const between = "between" in a ? a.between : undefined;

        // Possibly end the vertical container with a break
        children.forEach((c, i) => {
          if (i > 0) {
            // Stick the separator in the previous line
            if (between) {
              convertTerminal(
                between,
                node,
                process,
                parentOrientation === "vertical"
              );
            }
          }

          process.generateNode(c);
        });

        break;
      }

      // Containers are similar to nodes with children, but they
      // iteratore over something different: The node stays the same
      // while the attribute changes. This requires recursion and is
      // therefore handled in a separate case although it looks sort
      // of similar to tree recursion.
      case "container": {
        // Do not emit all sorts of useless newlines if there aren't any
        // children that would require them
        if (a.children.length > 0) {
          possiblyIndent(a, process, () => {
            possiblyBreakAfter(() => {
              processAttributes(
                a.children,
                types,
                node,
                process,
                a.orientation
              );
            });
          });
        }
      }
    }
  });
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
  node: SyntaxNode,
  process: CodeGeneratorProcess<any>
) {
  const t = ensureCodeGenType(types, node);
  processAttributes(t.attributes, types, node, process, "horizontal");
}
