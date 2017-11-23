import { BehaviorSubject, Observable } from 'rxjs'

import { Project } from '../project'
import { ProjectResource } from '../resource'

import { CodeResourceDescription } from './coderesource.description'
import { Tree, NodeDescription, NodeLocation } from './syntaxtree'

/**
 * A resource that is described by a syntaxtree.
 *
 * While the tree instance itself is also available via the nodes 
 * of the tree, the immutable nature makes it difficult to 
 * communicate changes upwards. The resource allows to replace
 * the whole tree and therefore enables mutating operations. So
 * this is additionaly a facade that hides the immutability of the
 * actual tree. If you ever call the mutating operations of the
 * raw Tree instance retrieved by syntaxTree() changes will not
 * be reflected in the code resource.
 */
export class CodeResource extends ProjectResource {

  private _tree = new BehaviorSubject<Tree>(new Tree(undefined));

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
   * @return An observable value of the language this id uses.
   */
  get languageIdObs(): Observable<string> {
    return (this._languageId);
  }

  /**
   * @param newId The ID of the new language this resource adheres to.
   */
  set languageId(newId: string) {
    this._languageId.next(newId);
    this.markSaveRequired();
  }

  /**
   * @return A peek at the tree that describes the code of this resource.
   */
  get syntaxTree(): Tree {
    return (this._tree.value);
  }

  /**
   * @return The tree that describes the code of this resource.
   */
  get obsSyntaxTree(): Observable<Tree> {
    return (this._tree);
  }

  /**
   * Replaces the node at the given location.
   *
   * @param loc The location of the node that should be replaced
   * @param desc The description of the node to put in place
   */
  replaceNode(loc: NodeLocation, desc: NodeDescription) {
    console.log(`Replacing node at ${JSON.stringify(loc)} with`, desc);

    this.replaceSyntaxTree(this.syntaxTree.replaceNode(loc, desc));
  }

  /**
   * Inserts the node at the given location.
   *
   * @param loc The location of the insertion.
   * @param desc The node to insert
   */
  insertNode(loc: NodeLocation, desc: NodeDescription) {
    console.log(`Inserting node at ${JSON.stringify(loc)}`, desc);

    this.replaceSyntaxTree(this.syntaxTree.insertNode(loc, desc));
  }

  /**
   * Deletes the node at the given location.
   *
   * @param loc The location of the insertion.
   */
  deleteNode(loc: NodeLocation) {
    console.log(`Deleting node at ${JSON.stringify(loc)}`);

    this.replaceSyntaxTree(this.syntaxTree.deleteNode(loc));
  }

  /**
   * Sets a new value for a property.
   *
   * @param loc The location of the node to edit.
   * @param key The name of the property.
   * @param value The new value of the property.
   */
  setProperty(loc: NodeLocation, key: string, value: string) {
    console.log(`Setting ${JSON.stringify(loc)} "${key}"="${value}"`);

    this.replaceSyntaxTree(this.syntaxTree.setProperty(loc, key, value));
  }

  /**
   * Adds a new property without specifying a value.
   *
   * @param loc The location of the node to edit.
   * @param key The name of the property.
   */
  addProperty(loc: NodeLocation, key: string) {
    console.log(`Adding ${JSON.stringify(loc)} property "${key}"`);

    this.replaceSyntaxTree(this.syntaxTree.addProperty(loc, key));
  }

  /**
   * Renames the key of a property.
   *
   * @param loc The location of the node to edit.
   * @param key The name of the property.
   * @param newKey The new name of the property.
   */
  renameProperty(loc: NodeLocation, key: string, newKey: string) {
    console.log(`Renaming property at ${JSON.stringify(loc)} from "${key}" to "${newKey}"`);

    this.replaceSyntaxTree(this.syntaxTree.renameProperty(loc, key, newKey));
  }

  /**
   * Adds an empty childgroup to the specified node.
   *
   * @param loc The location of the node to edit.
   * @param key The name of the child group.
   */
  addChildGroup(loc: NodeLocation, key: string) {
    console.log(`Adding empty childgroup "${key}" at ${JSON.stringify(loc)}`);

    this.replaceSyntaxTree(this.syntaxTree.addChildGroup(loc, key));
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
      ast: this.syntaxTree.toModel(),
      languageId: this.languageId
    });
  }

}
