import * as Desc from "./grammar.description";
import { QualifiedTypeName, NodeDescription } from "./syntaxtree.description";
import { FullNodeConcreteTypeDescription } from "./grammar-type-util.description";
import { typenameEquals } from "./syntaxtree";

/**
 * If no name is provided: Generates a name based on a running number and the type.
 */
export function ensureAttributeName(
  desc: Desc.NodeAttributeDescription,
  i: number,
  path: string[]
) {
  const printedPath = path.length > 0 ? path.join("_") + "_" : "";
  return desc.name || `${printedPath}${desc.type}_${i}`;
}

/**
 * Constructs a new set of languages where attributes in the given languages are guarenteed to be named.
 */
export function ensureGrammarAttributeNames(
  languages: Desc.NamedLanguages | Desc.VisualisedLanguages
): Desc.NamedLanguages | Desc.VisualisedLanguages {
  const copy: Desc.NamedLanguages = JSON.parse(JSON.stringify(languages));

  const impl = (
    attributes: Desc.NodeAttributeDescription[],
    path: string[]
  ) => {
    attributes.forEach((a, i) => {
      a.name = ensureAttributeName(a, i, path);

      if (a.type === "container") {
        impl(a.children, path.concat(a.name));
      }
    });
  };

  Object.values(copy).forEach((n) => {
    Object.values(n).forEach((t) => {
      if (t.type === "concrete" && t.attributes) {
        impl(t.attributes, []);
      }
    });
  });

  return copy;
}

/**
 * A NodeAttributeDescription that knows the name of its hosting grammar and
 * the type it is placed on.
 */
export type FullNodeAttributeDescription = Desc.NodeAttributeDescription & {
  languageName: string;
  typeName: string;
};

/**
 * @return All attributes of the given grammar in the form of a handy list.
 */
export function getFullQualifiedAttributes(
  languages: Desc.NamedLanguages
): FullNodeAttributeDescription[] {
  const toReturn: FullNodeAttributeDescription[] = [];
  const namedLanguages = ensureGrammarAttributeNames(languages);

  const recurseAttribute = (
    t: QualifiedNodeTypeDescription,
    a: Desc.NodeAttributeDescription
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

  getQualifiedTypes(namedLanguages).forEach((t) => {
    if (Desc.isNodeConcreteTypeDescription(t)) {
      (t.attributes || []).forEach((attribute) => {
        recurseAttribute(t, attribute);
      });
    }
  });

  return toReturn;
}

/**
 * Retrieve the node with the given attribute name, no matter how
 * deeply it is nested.
 */
export function getNodeAttribute(
  nodeDesc: Desc.NodeConcreteTypeDescription | Desc.NodeVisualTypeDescription,
  name: string
) {
  const recurseAttribute = (a: Desc.NodeAttributeDescription) => {
    if (a.name === name) {
      return a;
    } else if (a.type === "container") {
      for (let i = 0; i < a.children.length; i++) {
        const res = recurseAttribute(a.children[i]);
        if (res) {
          return res;
        }
      }
    }
  };

  for (let i = 0; i < nodeDesc.attributes.length; i++) {
    const res = recurseAttribute(nodeDesc.attributes[i]);
    if (res) {
      return res;
    }
  }

  return undefined;
}

export function resolveNodeTypeChildReference(
  ref: Desc.NodeTypesChildReference,
  languageName: string
): QualifiedTypeName {
  if (Desc.isChildCardinalityDescription(ref)) {
    return resolveNodeTypeChildReference(ref.nodeType, languageName);
  } else if (Desc.isQualifiedTypeName(ref)) {
    return ref;
  } else {
    return { languageName, typeName: ref };
  }
}

export function allChildTypes(
  attr: Desc.NodeChildrenGroupDescription,
  languageName: string
): QualifiedTypeName[] {
  // The node for the references is named slightly different, depending on the context
  const extractNodeTypes = () => {
    switch (attr.type) {
      case "allowed":
      case "sequence":
        return attr.nodeTypes;
      case "parentheses":
        return attr.group.nodeTypes;
      case "choice":
        return attr.choices;
    }
  };

  return extractNodeTypes().map((t) =>
    resolveNodeTypeChildReference(t, languageName)
  );
}

/**
 * The given type may or may not refer to a typedef. This function
 * walks down the type hierarchy until each and every type that
 * may appear as a typedef choice is resolved.
 */
export function resolveToConcreteTypes(
  t: QualifiedTypeName,
  g: Desc.NamedLanguages | Desc.VisualisedLanguages
): QualifiedTypeName[] {
  const toReturn: QualifiedTypeName[] = [];

  const impl = (t: QualifiedTypeName) => {
    const currType = g?.[t.languageName]?.[t.typeName];
    if (!currType) {
      throw new Error(
        `Unknown type ${JSON.stringify(
          t
        )} while resolving concrete types from ${JSON.stringify(g)}`
      );
    }

    if (currType.type === "oneOf") {
      currType.oneOf.forEach((option) =>
        impl(resolveNodeTypeChildReference(option, t.languageName))
      );
    } else {
      // Don't add items more than once
      if (!toReturn.find((o) => typenameEquals(o, t))) {
        return toReturn.push(t);
      }
    }
  };
  impl(t);

  return toReturn;
}

/**
 * A predicate with a NodeTypeDescription as argument
 */
type NodeTypeDescriptionPredicate = (t: Desc.NodeTypeDescription) => boolean;

/**
 * @return Names of all types in the given grammar in the form of a handy list
 */
function collectTypes(
  languages: Desc.NamedLanguages,
  pred: NodeTypeDescriptionPredicate
): QualifiedTypeName[] {
  const toReturn: QualifiedTypeName[] = [];

  if (!languages) {
    return [];
  }

  Object.entries(languages).forEach(([languageName, types]) => {
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
export function getTypeList(
  languages: Desc.NamedLanguages
): QualifiedTypeName[] {
  return collectTypes(languages, (_) => true);
}

/**
 * @return Names of all concrete types in the given grammar in the form of a handy list
 */
export function getConcreteTypes(
  languages: Desc.NamedLanguages
): QualifiedTypeName[] {
  return collectTypes(languages, Desc.isNodeConcreteTypeDescription);
}

/**
 * A node of any type that knows the name of its hosting grammar and
 * the type it is placed on.
 */
export type QualifiedNodeTypeDescription = (
  | Desc.NodeTypeDescription
  | Desc.NodeVisualTypeDescription
) & {
  languageName: string;
  typeName: string;
};

/**
 * @return All attributes of the given grammar in the form of a handy list.
 */
export function getQualifiedTypes(
  languages: Desc.NamedLanguages | Desc.VisualisedLanguages
): QualifiedNodeTypeDescription[] {
  const toReturn: QualifiedNodeTypeDescription[] = [];

  Object.entries(languages).forEach(
    ([langName, types]: [
      string,
      Desc.NodeTypeDescription | Desc.NodeVisualTypeDescription
    ]) => {
      Object.entries(types).forEach(([typeName, t]) => {
        toReturn.push(
          Object.assign({}, t, {
            languageName: langName,
            typeName: typeName,
          })
        );
      });
    }
  );

  return toReturn;
}

/**
 * Calculates the self contained, full description for a certain node type.
 */
export function fullNodeDescription(
  languages: Desc.NamedLanguages | Desc.VisualisedLanguages,
  typeName: QualifiedTypeName
): FullNodeConcreteTypeDescription;
export function fullNodeDescription(
  languages: Desc.NamedLanguages | Desc.VisualisedLanguages,
  typeName: string,
  languageName: string
): FullNodeConcreteTypeDescription;
export function fullNodeDescription(
  languages: Desc.NamedLanguages | Desc.VisualisedLanguages,
  typeName: string | QualifiedTypeName,
  languageName?: string
): FullNodeConcreteTypeDescription {
  if (typeof typeName === "object") {
    languageName = typeName.languageName;
    typeName = typeName.typeName;
  }

  const actualLang = languages[languageName];
  if (!actualLang) {
    throw new Error(`Language "${languageName}" does not exist on grammar`);
  }

  const actualType = actualLang[typeName];
  if (!actualType) {
    throw new Error(`Type "${typeName}" does not exist on grammar`);
  }

  if (actualType.type !== "concrete") {
    throw new Error(`Type "${typeName}" is not a concrete type`);
  }

  return {
    type: actualType.type,
    attributes: actualType.attributes,
    languageName: languageName,
    typeName: typeName,
  };
}

/**
 * @return A fully qualified typename, even if the input was a reference.
 */
export const ensureTypename = (
  ref: Desc.TypeReference | Desc.ChildCardinalityDescription,
  grammarName: string
): QualifiedTypeName => {
  if (Desc.isQualifiedTypeName(ref)) {
    return ref;
  } else if (Desc.isChildCardinalityDescription(ref)) {
    return ensureTypename(ref.nodeType, grammarName);
  } else {
    return { languageName: grammarName, typeName: ref };
  }
};

export type OrderedTypes = QualifiedTypeName[];

// Used to separate the language from the typename in the string representation
const TYPE_SEPARATOR = ".";

/**
 *
 */
export function stableQualifiedTypename(
  n: QualifiedTypeName | NodeDescription
): string {
  if (Desc.isQualifiedTypeName(n)) {
    return n.languageName + TYPE_SEPARATOR + n.typeName;
  } else {
    return n.language + TYPE_SEPARATOR + n.name;
  }
}

export function fromStableQualifiedTypename(n: string): QualifiedTypeName {
  const parts = n.split(TYPE_SEPARATOR);
  if (parts.length != 2) {
    throw new Error(`"${n}" is not a typename`);
  } else {
    return { languageName: parts[0], typeName: parts[1] };
  }
}

/**
 * @return A meaningful order of the types in the given grammar
 */
export function orderTypes(g: Desc.GrammarDocument): OrderedTypes {
  // Is there a root to work with
  const rootLang = g.root && g.types[g.root.languageName];

  // Ordering should work over all types in the document, not
  // just the local types
  const allTypes = allConcreteTypes(g);

  if (!rootLang || !rootLang[g.root.typeName]) {
    // No root available? We just return the order that we got
    const toReturn: OrderedTypes = [];
    Object.entries(allTypes).forEach(([langName, types]) => {
      Object.keys(types).forEach((typeName) => {
        toReturn.push({ languageName: langName, typeName: typeName });
      });
    });

    return toReturn;
  } else {
    const usedTypes = new Set<string>();
    const order: OrderedTypes = [];

    // Forward declaration
    let recurseType: (curr: QualifiedTypeName) => void = undefined;

    const handleAttribute = (
      a: Desc.NodeAttributeDescription,
      currLanguageName: string
    ) => {
      switch (a.type) {
        case "allowed":
        case "sequence":
          a.nodeTypes.forEach((t) => {
            recurseType(ensureTypename(t, currLanguageName));
          });
          break;
        case "choice":
          a.choices.forEach((t) => {
            recurseType(ensureTypename(t, currLanguageName));
          });
          break;
        case "container":
          a.children.forEach((t) => {
            handleAttribute(t, currLanguageName);
          });
          break;
      }
    };

    // Recursively walk through all types that are mentioned
    recurseType = (curr: QualifiedTypeName) => {
      // Don't do anything if the type has been mentioned already
      if (!usedTypes.has(stableQualifiedTypename(curr))) {
        usedTypes.add(stableQualifiedTypename(curr));
        order.push(curr);

        // Different types need to be treated differently
        const types = allTypes[curr.languageName];
        if (types && types[curr.typeName]) {
          const def = types[curr.typeName];
          switch (def.type) {
            // For concrete types: Add all types mentioned in childgroups
            case "concrete":
              (def.attributes || []).forEach((a) =>
                handleAttribute(a, curr.languageName)
              );
              break;
            case "oneOf":
              (def.oneOf || []).forEach((t) =>
                recurseType(ensureTypename(t, curr.languageName))
              );
              break;
          }
        }
      }
    };

    recurseType(g.root);

    // Add all unreferenced types
    const unreferenced = getQualifiedTypes(allTypes)
      // OUCH! Order of keys is important here, if "typeName" is mentioned first
      // the resulting string also has that key and value mentioned first
      .map(
        (t): QualifiedTypeName => {
          return { languageName: t.languageName, typeName: t.typeName };
        }
      )
      .filter((t) => !usedTypes.has(stableQualifiedTypename(t)));
    order.push(...unreferenced);

    return order;
  }
}

export type FilterType = (desc: Desc.NodeTypeDescription) => boolean;

/**
 * Returns a new object with all keys removed whose values didn't
 * satisfy the given predicate. If the predicate is not specified
 * the given object is returned as is. This is not a particularly
 * nice design but it allows this function to act as a NOP if no
 * predicate is specified.
 *
 * @param obj The input object to be filtered
 * @param predicate The predicate to use. No filter applied if omitted.
 * @return The filtered object.
 */
const objectFilter = <O extends Object, T>(
  obj: O,
  predicate?: (a0: T) => boolean
): Partial<O> => {
  if (predicate) {
    return Object.keys(obj)
      .filter((key) => predicate(obj[key]))
      .reduce((res, key) => ((res[key] = obj[key]), res), {});
  } else {
    return obj;
  }
};

/**
 * Extracts all types from the given document, with locally defined
 * types taking precedence over foreign types.
 *
 * @param g The whole grammar that has the types in question.
 * @param filter An optional filter to exclude some types
 */
export function allConcreteTypes(
  g: Desc.GrammarDocument,
  filter: FilterType = undefined
): Desc.NamedLanguages {
  const allLangKeys = new Set([
    ...Object.keys(g.types ?? []),
    ...Object.keys(g.foreignTypes ?? []),
  ]);

  const toReturn: Desc.NamedLanguages = {};

  allLangKeys.forEach((lang) => {
    toReturn[lang] = Object.assign(
      {},
      objectFilter(g.foreignTypes[lang] ?? {}, filter),
      objectFilter(g.types[lang] ?? {}, filter)
    );
  });

  return toReturn;
}

/**
 * Extracts all visualisations from the given document, with locally defined
 * types taking precedence over foreign types.
 *
 * @param g The whole grammar that has the types in question.
 * @param filter An optional filter to exclude some types
 */
export function allVisualisationTypes(
  g: Desc.GrammarDocument,
  filter: FilterType = undefined
): Desc.VisualisedLanguages {
  const allLangKeys = new Set([
    ...Object.keys(g.visualisations ?? []),
    ...Object.keys(g.foreignVisualisations ?? []),
  ]);

  const toReturn: Desc.VisualisedLanguages = {};

  allLangKeys.forEach((lang) => {
    toReturn[lang] = Object.assign(
      {},
      objectFilter(g.foreignVisualisations[lang] ?? {}, filter),
      objectFilter(g.visualizes[lang] ?? {}, filter)
    );
  });

  return toReturn;
}

/**
 * Extracts all types from the given document, with visual types taking precedence over
 * structural types and locally defined types taking precedence over foreign types.
 *
 * @param g The whole grammar that has the types in question.
 * @param filter An optional filter to exclude some types
 */
export function allVisualisableTypes(
  g: Desc.GrammarDocument,
  filter: FilterType = undefined
): Desc.NamedLanguages | Desc.VisualisedLanguages {
  // Using a set because we don't want any duplicates
  const allLangKeys = new Set([
    ...Object.keys(g.types ?? []),
    ...Object.keys(g.foreignTypes ?? []),
    ...Object.keys(g.visualisations ?? []),
    ...Object.keys(g.foreignVisualisations ?? []),
  ]);

  const toReturn: Desc.NamedLanguages = {};

  allLangKeys.forEach((lang) => {
    // Most important type last
    toReturn[lang] = Object.assign(
      {},
      objectFilter(g.foreignTypes?.[lang] ?? {}, filter),
      objectFilter(g.types?.[lang] ?? {}, filter),
      objectFilter(g.foreignVisualisations?.[lang] ?? {}, filter),
      objectFilter(g.visualisations?.[lang] ?? {}, filter)
    );
  });

  return toReturn;
}
