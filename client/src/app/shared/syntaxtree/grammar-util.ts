import {
  GrammarDocument, NodeChildrenGroupDescription,
  NodeTypesChildReference, OccursSpecificDescription, isQualifiedTypeName, isOccursSpecificDescription
} from "./grammar.description";
import { FullNodeConcreteTypeDescription } from "./grammar-util.description";
import { QualifiedTypeName } from "./syntaxtree.description";

/**
 * Calculates the self contained, full description for a certain node type.
 */
export function fullNodeDescription(
  grammar: GrammarDocument, typeName: QualifiedTypeName
): FullNodeConcreteTypeDescription;
export function fullNodeDescription(
  grammar: GrammarDocument, typeName: string, languageName: string
): FullNodeConcreteTypeDescription
export function fullNodeDescription(
  grammar: GrammarDocument, typeName: string | QualifiedTypeName, languageName?: string
): FullNodeConcreteTypeDescription {
  if (typeof typeName === "object") {
    languageName = typeName.languageName;
    typeName = typeName.typeName;
  }

  const actualType = grammar.types[typeName];
  if (!actualType) {
    throw new Error(`Type "${typeName}" does not exist on grammar`);
  }

  if (actualType.type !== "concrete") {
    throw new Error(`Type "${typeName}" is not a concrete type`);
  }

  return ({
    type: actualType.type,
    attributes: actualType.attributes,
    languageName: languageName,
    typeName: typeName
  });
}

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
