import {
  NodeDescription, NodeAttributeDescription,
  NodePropertyTypeDescription, NodeChildrenGroupDescription
} from '../../syntaxtree/'
import { FullNodeConcreteTypeDescription } from '../../syntaxtree/grammar-util.description'

// These values for "type" refer to a child group
const CHILD_GROUP_TYPES = new Set<NodeAttributeDescription["type"]>(
  ["sequence", "allowed", "choice"]
);

/**
 * Calculates a default value that has at least a type that matches the given type.
 * This value will hopefully satisfy the type, but further restrictions may hinder
 * this.
 */
export function defaultValue(propertyType: NodePropertyTypeDescription) {
  switch (propertyType.base) {
    case "boolean":
      return ("false");
    case "integer":
      return ("0");
    case "string":
      return ("");
  }
}

/**
 * A wild guess to create a meaningful default node if only the type
 * of a node is given.
 */
export function defaultNode(nodeType: FullNodeConcreteTypeDescription): NodeDescription {
  // Minimal requirement: Referenced type
  const toReturn: NodeDescription = {
    name: nodeType.typeName,
    language: nodeType.languageName
  };

  // Are there any attributes that require mapping?
  if (nodeType.attributes) {
    // Are there any child categories that are required? For the moment
    // we simply assume that a mentioned group is also required
    const requiredChildrenCategories = nodeType.attributes
      .filter(a => CHILD_GROUP_TYPES.has(a.type)) as NodeChildrenGroupDescription[];

    if (requiredChildrenCategories.length > 0) {
      toReturn.children = {};
      requiredChildrenCategories.forEach(childCategory => {
        toReturn.children[childCategory.name] = [];
      });
    }

    // Assign default values for properties
    const properties = nodeType.attributes
      .filter(a => a.type === "property") as NodePropertyTypeDescription[];

    if (properties.length > 0) {
      toReturn.properties = {};
      properties.forEach(p => {
        toReturn.properties[p.name] = defaultValue(p);
      });
    }
  }

  return (toReturn);
}