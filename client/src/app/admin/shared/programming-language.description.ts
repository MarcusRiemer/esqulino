import { IdentifiableResourceDescription } from '../../shared/resource.description';

/**
 * List data for a code resource that describes a grammar.
 */
export interface ProgrammingLanguageListDescription extends IdentifiableResourceDescription {
  name: string
}