import { BlattWerkzeugError } from "../blattwerkzeug-error";
import { OutputSeparator } from "./codegenerator-process";
import { stableQualifiedTypename } from "./grammar-type-util";
import {
  NamedLanguages,
  NodeConcreteTypeDescription,
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
 * May return the quoted value if there are tags demanding this.
 */
export function valueToPossiblyQuote(value: string, tags?: string[]): string {
  if ((tags ?? []).includes("double-quote")) {
    return `"${value}"`;
  } else {
    return value;
  }
}

const SEPARATOR_TAGS = new Set([
  "newline-after",
  "newline-before",
  "space-after",
  "space-before",
  "space-around",
]);
export function tagToSeparator(
  node: SyntaxNode,
  tags?: string[]
): OutputSeparator {
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
