import { ProjectResourceDescription } from '../resource.description'

import { NodeDescription } from './syntaxtree.description'

/**
 * A resource that is described by a syntaxtree.
 */
export interface CodeResourceDescription extends ProjectResourceDescription {
  // The tree that describes the code of this resource.
  ast?: NodeDescription;

  // The actual programming language this resource uses.
  programmingLanguageId: string;

  // The block language this resource uses
  blockLanguageId: string;
}
