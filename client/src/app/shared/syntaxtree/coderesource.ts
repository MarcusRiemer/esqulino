import { BehaviorSubject, Observable } from 'rxjs'

import { Project } from '../project'
import { ProjectResource } from '../resource'

import { CodeResourceDescription } from './coderesource.description'
import { Tree, NodeDescription } from './syntaxtree'

/**
 * A resource that is described by a syntaxtree.
 */
export class CodeResource extends ProjectResource {

  private _tree = new BehaviorSubject<Tree>(undefined);

  private _languageId = new BehaviorSubject<string>(undefined);

  constructor(desc: CodeResourceDescription, project?: Project) {
    super(desc, project);

    this.replaceSyntaxTree(desc.ast);
    this.languageId = desc.languageId;
  }

  /**
   * @return The ID of the language this resource uses.
   */
  get languageId() {
    return (this._languageId.value);
  }

  /**
   * @param newId The ID of the new language this resource adheres to.
   */
  set languageId(newId: string) {
    this._languageId.next(newId);
  }

  /**
   * @return A peek at the tree that describes the code of this resource.
   */
  get peekSyntaxTree(): Tree {
    return (this._tree.value);
  }

  /**
   * @return The tree that describes the code of this resource.
   */
  get syntaxTree(): Observable<Tree> {
    return (this._tree);
  }

  /**
   * @param tree The new tree that describes this resource.
   */
  replaceSyntaxTree(tree: Tree | NodeDescription) {
    if (tree instanceof Tree) {
      this._tree.next(tree);
    } else {
      this._tree.next(new Tree(tree));
    }
    this.markSaveRequired();
  }

  /**
   * @return Serialized description of this code resource.
   */
  toModel(): CodeResourceDescription {
    return ({
      id: this.id,
      name: this.name,
      apiVersion: this.apiVersion,
      ast: this.peekSyntaxTree.toModel(),
      languageId: this.languageId
    });
  }

}
