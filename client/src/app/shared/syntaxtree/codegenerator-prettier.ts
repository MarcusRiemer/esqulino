import { doc } from "prettier";
import { OutputSeparator } from "./codegenerator-process";
import {
  ensureCodeGenType,
  tagToSeparator,
  valueToPossiblyQuote,
} from "./codegenerator-util";
import {
  NamedLanguages,
  NodeAttributeDescription,
  NodeInterpolatePropertyDescription,
  NodePropertyTypeDescription,
  NodeTerminalSymbolDescription,
  Orientation,
  VisualisedLanguages,
} from "./grammar.description";
import { SyntaxNode } from "./syntaxtree";

// Documentation at https://github.com/prettier/prettier/blob/main/commands.md
// will be helpful when following this code.
type Doc = doc.builders.Doc;

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
  node: SyntaxNode
): Doc[] {
  const toReturn: Doc[] = [];
  const val = t.type === "terminal" ? t.symbol : node.properties[t.name];
  const sep = tagToSeparator(node, t.tags);

  if ((sep & OutputSeparator.NEW_LINE_BEFORE) > 0) {
    toReturn.push(doc.builders.hardline);
  }
  if ((sep & OutputSeparator.SPACE_BEFORE) > 0) {
    toReturn.push(" ");
  }

  toReturn.push(valueToPossiblyQuote(val, t.tags));

  if ((sep & OutputSeparator.SPACE_AFTER) > 0) {
    toReturn.push(" ");
  }

  if ((sep & OutputSeparator.NEW_LINE_AFTER) > 0) {
    toReturn.push(doc.builders.hardline);
  }

  return toReturn;
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
  parentOrientation: Orientation
): Doc[] {
  const toReturn: Doc[] = [];

  attributes.forEach((a) => {
    switch (a.type) {
      // Are converted by directly printing out some strings
      case "terminal":
      case "property":
      case "interpolate": {
        toReturn.push(...convertTerminal(a, node));
        break;
      }

      // All of the following types have child nodes which will be delegated
      // to the running emit process
      case "allowed":
      case "sequence":
      case "parentheses":
      case "each": {
        const children = node.getChildrenInCategory(a.name);
        const between =
          "between" in a ? convertTerminal(a.between, node) : [""];

        if (parentOrientation === "vertical") {
          between.push(doc.builders.hardline);
        }

        const childDocs = children.map((childNode) => {
          const t = ensureCodeGenType(types, childNode);
          return processAttributes(
            t.attributes,
            types,
            childNode,
            parentOrientation
          );
        });

        // Only actually build the subtree if there are any children inside
        // it. Otherwise we possibly introduce a hardline without having any
        // content
        if (childDocs.length > 0) {
          const joined = doc.builders.group(
            doc.builders.join(doc.builders.concat(between), childDocs.flat(1))
          );

          toReturn.push(joined);
        }

        break;
      }

      // Containers are similar to nodes with children, but they
      // iteratore over something different: The node stays the same
      // while the attribute changes. This requires recursion and is
      // therefore handled in a separate case although it looks sort
      // of similar to syntax tree recursion.
      case "container": {
        const childDocs = doc.builders.concat(
          processAttributes(a.children, types, node, a.orientation)
        );

        // Did we add more than that single hardline?
        if (childDocs.parts.length > 0) {
          // Vertical containers must start and end on their own line
          const indentSurround =
            a.orientation === "vertical" ? [doc.builders.hardline] : [];

          const finalChildDocs = a.tags?.includes("indent")
            ? // Leading break inside the indent, trailing break outside
              doc.builders.concat([
                doc.builders.indent(
                  doc.builders.concat([...indentSurround, childDocs])
                ),
                ...indentSurround,
              ])
            : doc.builders.group(childDocs);

          toReturn.push(finalChildDocs);
        }
      }
    }
  });

  return toReturn;
}

/**
 * Generate a fragment for the given node based on the type or visualisation
 * definitions for the current node.
 *
 * @param types The types that are the basis for code generation
 * @param node  The node to process
 * @param process The current code generation process
 */
export function prettierCodeGeneratorFromGrammar(
  types: NamedLanguages | VisualisedLanguages,
  node: SyntaxNode
): string {
  const t = ensureCodeGenType(types, node);
  const prettierTree = processAttributes(
    t.attributes,
    types,
    node,
    "horizontal"
  );
  const printed = doc.printer.printDocToString(
    // Don't leave last lines with nothing but whitespace
    doc.builders.concat([...prettierTree, doc.builders.trim]),
    {
      embeddedInHtml: false,
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
    }
  );

  return printed.formatted.trim();
}
