import { GrammarDocument } from "./grammar.description";
import { FullNodeConcreteTypeDescription } from "./grammar-util.description";
import { QualifiedTypeName } from "./syntaxtree.description";

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