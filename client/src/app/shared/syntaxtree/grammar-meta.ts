import { NodeDescription, QualifiedTypeName } from './syntaxtree.description'
import { Tree, Node } from './syntaxtree';
import {
  NodePropertyTypeDescription, NodeTerminalSymbolDescription, NodeChildrenGroupDescription,
  isNodeTypesSequenceDescription,
  isNodeTypesAllowedDescription,
  NodeTypesChildReference,
  NodeAttributeDescription,
  GrammarDocument,
  NodeConcreteTypeDescription,
  NodeOneOfTypeDescription
} from './grammar.description';

export function convertProperty(attrNode: Node): NodePropertyTypeDescription {
  return ({
    type: "property",
    base: attrNode.properties["base"] as any,
    name: attrNode.properties["name"]
  });
}

/**
 * Converts a node that represents a terminal symbol to a description.
 */
export function convertTerminal(attrNode: Node): NodeTerminalSymbolDescription {
  const toReturn: ReturnType<typeof convertTerminal> = {
    type: "terminal",
    symbol: attrNode.properties["symbol"]
  };

  if (attrNode.properties["name"]) {
    toReturn.name = attrNode.properties["name"];
  }

  return (toReturn);
}

export function convertChildren(attrNode: Node): NodeChildrenGroupDescription {
  const toReturn: ReturnType<typeof convertChildren> = {
    type: attrNode.properties["base"] as any,
    name: attrNode.properties["name"],
    nodeTypes: undefined
  };

  if (isNodeTypesAllowedDescription(toReturn) || isNodeTypesSequenceDescription(toReturn)) {
    const typeReferences: NodeTypesChildReference[] = attrNode.getChildrenInCategory("references").map(ref => {
      switch (ref.typeName) {
        case "nodeRefOne":
          return ({
            languageName: ref.properties["languageName"],
            typeName: ref.properties["typeName"]
          });
      }
    });

    toReturn.nodeTypes = typeReferences;
  }

  return (toReturn);
}

/**
 * Converts the given node into a description that is appended to the given
 * target list.
 */
export function readAttributes(attrNode: Node, target: NodeAttributeDescription[]) {
  switch (attrNode.typeName) {
    case "property":
      target.push(convertProperty(attrNode));
      break;
    case "terminal":
      target.push(convertTerminal(attrNode));
      break;
    case "children":
      target.push(convertChildren(attrNode));
      break;
  }
}

export function resolveReference(refNode: Node): QualifiedTypeName {
  switch (refNode.typeName) {
    case "nodeRefOne":
      return ({
        languageName: refNode.properties["languageName"],
        typeName: refNode.properties["typeName"]
      });
    default:
      throw new Error(`Could not resolve reference of type "${refNode.languageName}"."${refNode.typeName}"`);
  }
}

/**
 * Convert an AST to a "proper" JSON-object.
 */
export function readFromNode(node: NodeDescription): GrammarDocument {
  const toReturn: ReturnType<typeof readFromNode> = {
    types: {},
    root: undefined
  };

  const tree = new Tree(node);

  // Extract the root this tree defines
  const nodeRoot = tree.rootNode.getChildInCategory("root");
  if (nodeRoot) {
    toReturn.root = {
      languageName: nodeRoot.properties["languageName"],
      typeName: nodeRoot.properties["typeName"]
    };
  }

  // Add all defined types
  const definedTypes = tree.rootNode.getChildrenInCategory("nodes");
  definedTypes
    .filter(n => n.typeName.match(/typedef|concreteNode/))
    .forEach(n => {
      const languageName = n.properties["languageName"];
      const typeName = n.properties["typeName"];

      if (!typeName || !languageName) {
        throw new Error(`Attempted to read node without qualified Type: ${JSON.stringify(n.toModel())}`);
      }

      // Ensure the language is known
      if (!toReturn.types[languageName]) {
        toReturn.types[languageName] = {};
      }

      // Ensure the type is not already taken
      const lang = toReturn.types[languageName];
      if (lang[typeName]) {
        throw new Error(`Duplicate type "${languageName}.${typeName}"`);
      }

      // Add the correct type of type
      switch (n.typeName) {
        case "concreteNode":
          const concreteNode: NodeConcreteTypeDescription = {
            type: "concrete",
            attributes: []
          };

          n.getChildrenInCategory("attributes").forEach(a => readAttributes(a, concreteNode.attributes));

          lang[typeName] = concreteNode;
          break;
        case "typedef":
          const references = n.getChildrenInCategory("references").map(resolveReference);

          const oneOfNode: NodeOneOfTypeDescription = {
            type: "oneOf",
            oneOf: references
          };

          lang[typeName] = oneOfNode;
          break;
        default:
          throw Error(`Unknown definition "${languageName}"."${typeName}" with type "${n.typeName}"`);
      }
    });

  return (toReturn);
}