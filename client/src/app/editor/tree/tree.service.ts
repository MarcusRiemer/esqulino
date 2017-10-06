import { BehaviorSubject, Observable } from 'rxjs'

import { Injectable } from '@angular/core';

import { Tree, Node, NodeDescription, NodeLocation } from '../../shared/syntaxtree';

/**
 * This service represents a single tree that is currently beeing
 * edited. It is meant to be instanciated by every tree editor
 * to be available in all node components of that editor.
 *
 * While the tree instance itself is also available via the nodes 
 * of the tree, the immutable nature makes it difficult to 
 * communicate changes upwards. This service allows to replace
 * the whole tree and therefore enables mutating operations. So
 * this is basicly a facade that hides the immutability of the
 * actual tree.
 */
@Injectable()
export class TreeService {
  private _tree = new BehaviorSubject<Tree>(undefined);

  /**
   * @param desc The new tree that should be available in the editor.
   */
  replaceTree(tree: NodeDescription | Tree) {
    if (tree instanceof Tree) {
      this._tree.next(tree);
    } else {
      this._tree.next(new Tree(tree));
    }
  }

  /**
   * Replaces the node at the given location.
   *
   * @param loc The location of the node that should be replaced
   * @param desc The description of the node to put in place
   */
  replaceNode(loc: NodeLocation, desc: NodeDescription) {
    console.log(`Replacing node at ${JSON.stringify(loc)} with`, desc);

    this.replaceTree(this.tree.replaceNode(loc, desc));
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

    this.replaceTree(this.tree.setProperty(loc, key, value));
  }

  /**
   * @return The tree that is currently edited.
   */
  get tree() {
    return (this._tree.getValue());
  }

  /**
   * @return An observable of the tree that is currently edited.
   */
  get currentTree(): Observable<Tree> {
    return (this._tree);
  }
}
