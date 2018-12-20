import * as Desc from "./grammar.description";
import { QualifiedTypeName } from "./syntaxtree.description";
import { FullNodeConcreteTypeDescription } from "./grammar-type-util.description";

/**
 * Calculates the self contained, full description for a certain node type.
 */
export function fullNodeDescription(
  grammar: Desc.GrammarDocument, typeName: QualifiedTypeName
): FullNodeConcreteTypeDescription;
export function fullNodeDescription(
  grammar: Desc.GrammarDocument, typeName: string, languageName: string
): FullNodeConcreteTypeDescription
export function fullNodeDescription(
  grammar: Desc.GrammarDocument, typeName: string | QualifiedTypeName, languageName?: string
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
 * @return A fully qualified typename, even if the input was a reference.
 */
export const ensureTypename = (ref: Desc.TypeReference | Desc.ChildCardinalityDescription, grammarName: string): QualifiedTypeName => {
  if (Desc.isQualifiedTypeName(ref)) {
    return (ref);
  } else if (Desc.isChildCardinalityDescription(ref)) {
    return (ensureTypename(ref.nodeType, grammarName));
  } else {
    return { languageName: grammarName, typeName: ref };
  }
};


export type OrderedTypes = QualifiedTypeName[];

/**
 * @return A meaningful order of the types in the given grammar
 */
export function orderTypes(g: Desc.GrammarDocument): OrderedTypes {
  const rootType: QualifiedTypeName = ensureTypename(g.root, g.technicalName);

  // No root available? We just return the order that we got
  if (rootType.languageName != g.technicalName || !(rootType.typeName in g.types)) {
    return (
      Object
        .keys(g.types)
        .map(k => ensureTypename(k, g.technicalName))
    );
  } else {
    const usedTypes = new Set<string>();
    const order: OrderedTypes = [];

    // Recursively walk through all types that are mentioned
    const impl = (curr: QualifiedTypeName) => {
      // Don't do anything if the type has been mentioned already
      if (!usedTypes.has(JSON.stringify(curr))) {
        usedTypes.add(JSON.stringify(curr));
        order.push(curr);

        // Different types need to be treated differently
        const def = g.types[curr.typeName];
        if (def) {
          switch (def.type) {
            // For concrete types: Add all types mentioned in childgroups
            case "concrete":
              (def.attributes || []).forEach(a => {
                switch (a.type) {
                  case "allowed":
                  case "sequence":
                    a.nodeTypes.forEach(t => {
                      impl(ensureTypename(t, g.technicalName));
                    });
                    break;
                  case "choice":
                    a.choices.forEach(t => {
                      impl(ensureTypename(t, g.technicalName));
                    });
                    break;
                }
              });
              break;
            case "oneOf":
              (def.oneOf || []).forEach(t => impl(ensureTypename(t, g.technicalName)));
              break;
          }
        }
      }
    }

    impl(rootType);

    // Add all unreferenced types
    const unreferenced = Object.keys(g.types)
      .map(k => ensureTypename(k, g.technicalName))
      .filter(k => !usedTypes.has(JSON.stringify(k)));
    order.push(...unreferenced);

    return (order);
  }
}
