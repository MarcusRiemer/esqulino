import { NodeConcreteTypeDescription } from "./grammar.description";

/**
 * A description that includes the name of the language and the name
 * of the type itself.
 */
export interface FullNodeConcreteTypeDescription
  extends NodeConcreteTypeDescription {
  typeName: string;
  languageName: string;
}
