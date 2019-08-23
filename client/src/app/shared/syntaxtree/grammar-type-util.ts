import * as Desc from "./grammar.description";
import { QualifiedTypeName } from "./syntaxtree.description";
import { FullNodeConcreteTypeDescription } from "./grammar-type-util.description";
import { getQualifiedTypes } from './grammar-util';

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

  const actualLang = grammar.types[languageName];
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
 *
 */
export function stableQualifiedTypename(n: QualifiedTypeName): string {
  return (n.languageName + "." + n.typeName);
}

/**
 * @return A meaningful order of the types in the given grammar
 */
export function orderTypes(g: Desc.GrammarDocument): OrderedTypes {
  // Is there a root to work with
  const rootLang = g.root && g.types[g.root.languageName];
  if (!rootLang || !rootLang[g.root.typeName]) {
    // No root available? We just return the order that we got
    const toReturn: OrderedTypes = [];
    Object.entries(g.types).forEach(([langName, types]) => {
      Object.keys(types).forEach(typeName => {
        toReturn.push({ languageName: langName, typeName: typeName });
      });
    });

    return (toReturn);
  } else {
    const usedTypes = new Set<string>();
    const order: OrderedTypes = [];

    // Recursively walk through all types that are mentioned
    const impl = (curr: QualifiedTypeName) => {
      // Don't do anything if the type has been mentioned already
      if (!usedTypes.has(stableQualifiedTypename(curr))) {
        usedTypes.add(stableQualifiedTypename(curr));
        order.push(curr);

        // Different types need to be treated differently
        const types = g.types[curr.languageName];
        if (types && types[curr.typeName]) {
          const def = types[curr.typeName];
          switch (def.type) {
            // For concrete types: Add all types mentioned in childgroups
            case "concrete":
              (def.attributes || []).forEach(a => {
                switch (a.type) {
                  case "allowed":
                  case "sequence":
                    a.nodeTypes.forEach(t => {
                      impl(ensureTypename(t, curr.languageName));
                    });
                    break;
                  case "choice":
                    a.choices.forEach(t => {
                      impl(ensureTypename(t, curr.languageName));
                    });
                    break;
                }
              });
              break;
            case "oneOf":
              (def.oneOf || []).forEach(t => impl(ensureTypename(t, curr.languageName)));
              break;
          }
        }
      }
    }

    impl(g.root);

    // Add all unreferenced types
    const unreferenced = getQualifiedTypes(g)
      // OUCH! Order of keys is important here, if "typeName" is mentioned first
      // the resulting string also has that key and value mentioned first
      .map((t): QualifiedTypeName => { return ({ languageName: t.languageName, typeName: t.typeName }) })
      .filter(t => !usedTypes.has(stableQualifiedTypename(t)));
    order.push(...unreferenced);

    return (order);
  }
}
