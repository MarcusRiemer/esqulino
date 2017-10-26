import { Project } from '../project'
import { ProjectResource } from '../resource'

import { CodeResourceDescription } from './coderesource.description'
import { Tree } from './syntaxtree'

/**
 * A resource that is described by a syntaxtree.
 */
export class CodeResource extends ProjectResource {

  private _tree: Tree;

  private _languageId: string;

  constructor(desc: CodeResourceDescription, project?: Project) {
    super(desc, project);

    this._tree = new Tree(desc.ast);
    this._languageId = desc.languageId;
  }

  /**
   * @return The ID of the language this resource uses.
   */
  get languageId() {
    return (this._languageId);
  }

  /**
   * @return The tree that describes the code of this resource.
   */
  get syntaxTree() {
    return (this._tree);
  }

  /**
   * @return Serialized description of this code resource.
   */
  toModel(): CodeResourceDescription {
    return ({
      id: this.id,
      name: this.name,
      apiVersion: this.apiVersion,
      ast: this._tree.toModel(),
      languageId: this._languageId
    });
  }

}
