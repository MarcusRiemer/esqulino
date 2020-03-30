import {
  NodeChildrenGroupDescription,
  NodeTypesChildReference,
  isQualifiedTypeName,
  NodeAttributeDescription,
  isNodeConcreteTypeDescription,
  GrammarDocument,
  NodeTypeDescription,
} from "./grammar.description";
import { QualifiedTypeName } from "./syntaxtree.description";
import {
  isOccursSpecificDescription,
  resolveOccurs,
  OccursSpecificDescription,
} from "./occurs";

/**
 * Takes any kind of reference and returns the number of occurences this reference
 * could legally make.
 */
export function resolveChildOccurs(
  typeDesc: NodeTypesChildReference
): OccursSpecificDescription {
  if (typeof typeDesc === "string" || isQualifiedTypeName(typeDesc)) {
    return { minOccurs: 1, maxOccurs: 1 };
  } else if (isOccursSpecificDescription(typeDesc.occurs)) {
    return typeDesc.occurs;
  } else {
    return resolveOccurs(typeDesc.occurs);
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
      return attrDescription.nodeTypes.some(
        (c) => resolveChildOccurs(c).minOccurs > 0
      );
    case "choice":
      return true;
    default:
      return false;
  }
}

/**
 * A NodeAttributeDescription that knows the name of its hosting grammar and
 * the type it is placed on.
 */
export type QualifiedNodeTypeDescription = NodeTypeDescription & {
  languageName: string;
  typeName: string;
};

/**
 * @return All attributes of the given grammar in the form of a handy list.
 */
export function getQualifiedTypes(
  g: GrammarDocument
): QualifiedNodeTypeDescription[] {
  const toReturn: QualifiedNodeTypeDescription[] = [];

  Object.entries(g.types || {}).forEach(([langName, types]) => {
    Object.entries(types).forEach(([typeName, t]) => {
      toReturn.push(
        Object.assign({}, t, {
          languageName: langName,
          typeName: typeName,
        })
      );
    });
  });

  return toReturn;
}

/**
 * A NodeAttributeDescription that knows the name of its hosting grammar and
 * the type it is placed on.
 */
export type FullNodeAttributeDescription = NodeAttributeDescription & {
  languageName: string;
  typeName: string;
};

/**
 * @return All attributes of the given grammar in the form of a handy list.
 */
export function getFullQualifiedAttributes(
  g: GrammarDocument
): FullNodeAttributeDescription[] {
  const toReturn: FullNodeAttributeDescription[] = [];
  const namedGrammar = ensureGrammarAttributeNames(g);

  const recurseAttribute = (
    t: QualifiedNodeTypeDescription,
    a: NodeAttributeDescription
  ) => {
    toReturn.push(
      Object.assign({}, a, {
        languageName: t.languageName,
        typeName: t.typeName,
      })
    );

    if (a.type === "container") {
      a.children.forEach((c) => recurseAttribute(t, c));
    }
  };

  getQualifiedTypes(namedGrammar).forEach((t) => {
    if (isNodeConcreteTypeDescription(t)) {
      (t.attributes || []).forEach((attribute) => {
        recurseAttribute(t, attribute);
      });
    }
  });

  return toReturn;
}

/**
 * A predicate with a NodeTypeDescription as argument
 */
type NodeTypeDescriptionPredicate = (t: NodeTypeDescription) => boolean;

/**
 * @return Names of all types in the given grammar in the form of a handy list
 */
function collectTypes(
  g: GrammarDocument,
  pred: NodeTypeDescriptionPredicate
): QualifiedTypeName[] {
  const toReturn: QualifiedTypeName[] = [];

  if (!g) {
    return [];
  }

  Object.entries(g.types || {}).forEach(([languageName, types]) => {
    Object.entries(types).forEach(([typeName, type]) => {
      if (pred(type)) {
        toReturn.push({
          languageName: languageName,
          typeName: typeName,
        });
      }
    });
  });

  return toReturn;
}

/**
 * @return Names of all types in the given grammar in the form of a handy list
 */
export function getAllTypes(g: GrammarDocument): QualifiedTypeName[] {
  return collectTypes(g, (_) => true);
}

/**
 * @return Names of all concrete types in the given grammar in the form of a handy list
 */
export function getConcreteTypes(g: GrammarDocument): QualifiedTypeName[] {
  return collectTypes(g, isNodeConcreteTypeDescription);
}

/**
 * If no name is provided: Generates a name based on a running number and the type.
 */
export function ensureAttributeName(
  desc: NodeAttributeDescription,
  i: number,
  path: string[]
) {
  const printedPath = path.length > 0 ? path.join("_") + "_" : "";
  return desc.name || `${printedPath}${desc.type}_${i}`;
}

/**
 * Constructs a new grammar where attributes in the given grammar are guarenteed to be named.
 */
export function ensureGrammarAttributeNames(
  desc: GrammarDocument
): GrammarDocument {
  const copy: GrammarDocument = JSON.parse(JSON.stringify(desc));

  const impl = (attributes: NodeAttributeDescription[], path: string[]) => {
    attributes.forEach((a, i) => {
      a.name = ensureAttributeName(a, i, path);

      if (a.type === "container") {
        impl(a.children, path.concat(a.name));
      }
    });
  };

  Object.values(copy.types).forEach((n) => {
    Object.values(n).forEach((t) => {
      if (t.type === "concrete") {
        impl(t.attributes, []);
      }
    });
  });

  return copy;
}
