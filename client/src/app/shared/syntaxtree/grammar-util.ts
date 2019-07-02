import {
  NodeChildrenGroupDescription, NodeTypesChildReference,
  isQualifiedTypeName, NodeAttributeDescription, isNodeConcreteTypeDescription,
  GrammarDocument,
} from "./grammar.description";
import { QualifiedTypeName } from "./syntaxtree.description";
import { isOccursSpecificDescription, resolveOccurs, OccursSpecificDescription } from './occurs';

/**
 * Takes any kind of reference and returns the number of occurences this reference
 * could legally make.
 */
export function resolveChildOccurs(typeDesc: NodeTypesChildReference): OccursSpecificDescription {
  if (typeof typeDesc === "string" || isQualifiedTypeName(typeDesc)) {
    return ({ minOccurs: 1, maxOccurs: 1 });
  } else if (isOccursSpecificDescription(typeDesc.occurs)) {
    return typeDesc.occurs;
  } else {
    return (resolveOccurs(typeDesc.occurs));
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
      return (attrDescription.nodeTypes.some(c => resolveChildOccurs(c).minOccurs > 0));
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
export function getFullAttributes(g: GrammarDocument): FullNodeAttributeDescription[] {
  const toReturn: FullNodeAttributeDescription[] = [];

  Object.entries(g.types || {}).forEach(([typeName, type]) => {
    if (isNodeConcreteTypeDescription(type)) {
      (type.attributes || []).forEach(attribute => {
        toReturn.push(Object.assign({}, attribute, {
          grammarName: g.technicalName,
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
export function getFullBlocks(g: GrammarDocument): QualifiedTypeName[] {
  const toReturn: QualifiedTypeName[] = [];

  Object.entries(g.types || {}).forEach(([typeName, type]) => {
    if (isNodeConcreteTypeDescription(type)) {
      toReturn.push({
        languageName: g.technicalName,
        typeName: typeName
      });
    }
  });

  return (toReturn);
}