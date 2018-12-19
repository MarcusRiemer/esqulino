import {
  NodeChildrenGroupDescription,
  NodeTypesChildReference, OccursSpecificDescription,
  isQualifiedTypeName, isOccursSpecificDescription,
  NodeAttributeDescription, isNodeConcreteTypeDescription,
  GrammarDescription
} from "./grammar.description";
import { QualifiedTypeName } from "./syntaxtree.description";

/**
 * Takes any kind of reference and returns the number of occurences this reference
 * could legally make.
 */
export function resolveOccurs(typeDesc: NodeTypesChildReference): OccursSpecificDescription {
  if (typeof typeDesc === "string" || isQualifiedTypeName(typeDesc)) {
    return ({ minOccurs: 1, maxOccurs: 1 });
  } else {
    if (isOccursSpecificDescription(typeDesc.occurs)) {
      return typeDesc.occurs;
    } else {
      switch (typeDesc.occurs) {
        case "*": return ({ minOccurs: 0, maxOccurs: +Infinity });
        case "?": return ({ minOccurs: 0, maxOccurs: 1 });
        case "+": return ({ minOccurs: 1, maxOccurs: +Infinity });
        case "1": return ({ minOccurs: 1, maxOccurs: 1 });
        default: throw new Error(`Unknown occurences: "${JSON.stringify(typeDesc)}"`);
      }
    }
  }
}

/**
 * Calculates whether the given child group would definitely be an error if it wouldn't
 * have any children.
 */
export function isHoleIfEmpty(attrDescription: NodeChildrenGroupDescription) {
  switch (attrDescription.type) {
    case "allowed":
    case "sequence":
      // Can we find any evidence that this should be a hole?
      return (attrDescription.nodeTypes.some(c => resolveOccurs(c).minOccurs > 0));
    case "choice":
      return (true);
    default:
      return (false);
  }
}

/**
 * A NodeAttributeDescription that knows the name of its hosting grammar and
 * the type it is placed on.
 */
export type FullNodeAttributeDescription = NodeAttributeDescription & {
  grammarName: string
  typeName: string
}

/**
 * @return All attributes of the given grammar in the form of a handy list.
 */
export function getFullAttributes(g: GrammarDescription): FullNodeAttributeDescription[] {
  const toReturn: FullNodeAttributeDescription[] = [];

  Object.entries(g.types || {}).forEach(([typeName, type]) => {
    if (isNodeConcreteTypeDescription(type)) {
      (type.attributes || []).forEach(attribute => {
        toReturn.push(Object.assign({}, attribute, {
          grammarName: g.name,
          typeName: typeName
        }));
      });
    }
  });

  return (toReturn);
}

/**
 * @return Names of all blocks of the given grammar in the form of a handy list
 */
export function getFullBlocks(g: GrammarDescription): QualifiedTypeName[] {
  const toReturn: QualifiedTypeName[] = [];

  Object.entries(g.types || {}).forEach(([typeName, type]) => {
    if (isNodeConcreteTypeDescription(type)) {
      toReturn.push({
        languageName: g.name,
        typeName: typeName
      });
    }
  });

  return (toReturn);
}