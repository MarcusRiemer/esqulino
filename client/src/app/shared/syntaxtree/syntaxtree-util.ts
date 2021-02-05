import { Tree, Node, printableTypename } from "./syntaxtree";
import {
  NamedLanguages,
  GrammarDocument,
  isGrammarDocument,
} from "./grammar.description";
import {
  allConcreteTypes,
  getTypeList,
  stableQualifiedTypename,
} from "./grammar-type-util";
import { NodeDescription } from "./syntaxtree.description";

/**
 * Calculates all resource IDs that are referenced in the given AST.
 */
export function referencedResourceIds(
  ast: Tree | Node | NodeDescription,
  types: NamedLanguages | GrammarDocument,
  searched: "codeResourceReference" | "grammarReference"
): string[] {
  const resolveAstArg = (ast: Tree | Node | NodeDescription): Node => {
    if (!ast) {
      return undefined;
    } else if (ast instanceof Tree) {
      if (ast.isEmpty) {
        return undefined;
      } else {
        return ast.rootNode;
      }
    } else if (ast instanceof Node) {
      return ast;
    } else {
      return new Node(ast, undefined);
    }
  };

  const n = resolveAstArg(ast);

  // The completely empty AST has no references
  if (!n) {
    return [];
  }

  // Captured by recursive implementation
  const toReturn: string[] = [];

  // Ensure we are always dealing with all types
  const allTypes = isGrammarDocument(types) ? allConcreteTypes(types) : types;

  const impl = (n: Node) => {
    const nodeType = allTypes[n.languageName]?.[n.typeName];

    // Ensure the type exists in the given grammar
    if (!nodeType) {
      const typeStr = printableTypename(n);
      const available = getTypeList(allTypes).map(stableQualifiedTypename);
      throw new Error(
        `Encountered unknown type ${typeStr} while collecting referenced resources.` +
          `Available types are: ${available.join(", ")}`
      );
    }

    // Ensure this is not a virtual node
    // In practice this shouldn't be possible to happen as it
    // would mean the tree itself is horribly invalid.
    if (nodeType.type === "oneOf") {
      const typeStr = printableTypename(n);
      throw new Error(
        `Encountered "oneOf" type ${typeStr} while collecting referenced resources`
      );
    }

    // Find all attributes that are references
    const refAttributes = nodeType.attributes.filter(
      (a) => a.type === "property" && a.base === searched
    );

    // And add all IDs that are found in these properties
    refAttributes.forEach((a) => {
      const refId = n.properties[a.name];
      if (refId) {
        toReturn.push(refId);
      }
    });

    // Recurse into children
    n.childrenCategoryNames.forEach((category) => {
      n.getChildrenInCategory(category).forEach(impl);
    });
  };

  // Kick off recursion
  impl(n);

  return toReturn;
}
