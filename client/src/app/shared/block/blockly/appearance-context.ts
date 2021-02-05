import {
  isVisualizableType,
  NodeAttributeDescription,
  Orientation,
  NodeTypesChildReference,
  QualifiedTypeName,
  typenameEquals,
  NamedLanguages,
  VisualisedLanguages,
} from "../../syntaxtree/";

import {
  QualifiedNodeTypeDescription,
  stableQualifiedTypename,
  resolveNodeTypeChildReference,
  resolveToConcreteTypes,
  getQualifiedTypes,
} from "../../syntaxtree/grammar-type-util";

/**
 * Blockly requires a single, definitive description for each and every
 * block. But the layout of those blocks depends on the context in which
 * they are used.
 */
export type AppearanceContext = {
  typeDetails: {
    [typename: string]: {
      orientation: Set<Orientation>;
    };
  };
  qualifiedTypes: QualifiedNodeTypeDescription[];
  types: NamedLanguages | VisualisedLanguages;
};

/**
 * Ensures that only valid appearances are present in the given context.
 */
function assertValidAppearances(ac: AppearanceContext) {
  const invalid = Object.entries(ac.typeDetails)
    .filter(([_t, single]) => single.orientation.size > 1)
    .map(([t, single]) => {
      return {
        t,
        orientations: Array.from(single.orientation),
      };
    });
  if (invalid.length > 0) {
    throw new Error(`Invalid appearances for ${JSON.stringify(invalid)}`);
  }
}

/**
 * This function takes a look at all contexts that exist
 * for a certain set of types and gathers information that might be relevant
 * for block layout decisions.
 */
export function buildAppearanceContext(
  types: NamedLanguages,
  assertValid = true
): AppearanceContext {
  const qualifiedTypes: QualifiedNodeTypeDescription[] = getQualifiedTypes(
    types
  );

  const toReturn: AppearanceContext = {
    qualifiedTypes,
    types,
    typeDetails: {},
  };

  const typeDetails = toReturn.typeDetails;

  // When a type references a typedef, all those "typedefed" types
  // appear in that context.
  const typedefs: { [typename: string]: QualifiedTypeName[] } = {};
  qualifiedTypes.forEach((t) => {
    if (t.type === "oneOf") {
      const strRef = stableQualifiedTypename(t);
      typedefs[strRef] = resolveToConcreteTypes(t, types);
    }
  });

  // The given type was seen in the given context
  const addAppearance = (
    _from: NodeAttributeDescription,
    ref: NodeTypesChildReference,
    o: Orientation,
    languageName: string
  ) => {
    const targetTypeRef = resolveNodeTypeChildReference(ref, languageName);
    const targetTypeDesc = qualifiedTypes.find((rhs) =>
      typenameEquals(targetTypeRef, rhs)
    );

    const affected: QualifiedTypeName[] = [];

    // If we have a concrete type, it is immediatly affected
    if (
      targetTypeDesc.type === "concrete" ||
      targetTypeDesc.type === "visualize"
    ) {
      affected.push(targetTypeRef);
    }
    // A type reference on the other hand needs to be resolved
    else {
      affected.push(
        ...(typedefs[stableQualifiedTypename(targetTypeRef)] ?? [])
      );
    }

    affected.forEach((affectedType) => {
      const stringRef = stableQualifiedTypename(affectedType);
      if (!typeDetails[stringRef]) {
        typeDetails[stringRef] = { orientation: new Set() };
      }
      typeDetails[stringRef].orientation.add(o);
    });
  };

  const walkAttributes = (
    attributes: NodeAttributeDescription[],
    orientation: Orientation,
    languageName: string
  ) => {
    (attributes ?? []).forEach((a) => {
      switch (a.type) {
        case "allowed":
        case "sequence":
          a.nodeTypes.forEach((ref) =>
            addAppearance(a, ref, orientation, languageName)
          );
          break;
        case "choice":
          a.choices.forEach((ref) =>
            addAppearance(a, ref, orientation, languageName)
          );
          break;
        case "parentheses":
          a.group.nodeTypes.forEach((ref) =>
            addAppearance(a, ref, orientation, languageName)
          );
          break;
        case "container":
          walkAttributes(a.children, a.orientation, languageName);
          break;
      }
    });
  };

  qualifiedTypes.forEach((t) => {
    if (isVisualizableType(t)) {
      walkAttributes(t.attributes, "horizontal", t.languageName);
    }
  });

  if (assertValid) {
    assertValidAppearances(toReturn);
  }

  return toReturn;
}

export function blockOrientation(
  t: QualifiedTypeName,
  ac: AppearanceContext
): Orientation {
  const str = stableQualifiedTypename(t);
  const singleContext = ac.typeDetails[str];
  if (!singleContext || singleContext.orientation.has("vertical")) {
    return "vertical";
  } else if (singleContext.orientation.has("horizontal")) {
    return "horizontal";
  }
}
