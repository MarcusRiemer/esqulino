import {
  NodeChildrenGroupDescription, NodeTypesChildReference,
  isQualifiedTypeName, NodeAttributeDescription, isNodeConcreteTypeDescription,
  GrammarDocument,
  NodeTypeDescription,
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
export type QualifiedNodeTypeDescription = NodeTypeDescription & {
  languageName: string
  typeName: string
}

/**
 * @return All attributes of the given grammar in the form of a handy list.
 */
export function getQualifiedTypes(g: GrammarDocument): QualifiedNodeTypeDescription[] {
  const toReturn: QualifiedNodeTypeDescription[] = [];

  Object.entries(g.types || {}).forEach(([langName, types]) => {
    Object.entries(types).forEach(([typeName, t]) => {
      toReturn.push(Object.assign({}, t, {
        languageName: langName,
        typeName: typeName
      }));
    });
  });

  return (toReturn);
}

/**
 * A NodeAttributeDescription that knows the name of its hosting grammar and
 * the type it is placed on.
 */
export type FullNodeAttributeDescription = NodeAttributeDescription & {
  languageName: string
  typeName: string
}

/**
 * @return All attributes of the given grammar in the form of a handy list.
 */
export function getFullQualifiedAttributes(g: GrammarDocument): FullNodeAttributeDescription[] {
  const toReturn: FullNodeAttributeDescription[] = [];

  getQualifiedTypes(g).forEach(t => {
    if (isNodeConcreteTypeDescription(t)) {
      (t.attributes || []).forEach(attribute => {
        toReturn.push(Object.assign({}, attribute, {
          languageName: t.languageName,
          typeName: t.typeName
        }));
      });
    }
  });

  return (toReturn);
}

/**
 * @return Names of all blocks of the given grammar in the form of a handy list
 */
export function getConcreteTypes(g: GrammarDocument): QualifiedTypeName[] {
  const toReturn: QualifiedTypeName[] = [];

  Object.entries(g.types || {}).forEach(([languageName, types]) => {
    Object.entries(types).forEach(([typeName, type]) => {
      if (isNodeConcreteTypeDescription(type)) {
        toReturn.push({
          languageName: languageName,
          typeName: typeName
        });
      }

    });
  });

  return (toReturn);
}