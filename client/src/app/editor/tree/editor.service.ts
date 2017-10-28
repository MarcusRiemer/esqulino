import { BehaviorSubject, Observable } from 'rxjs'

import { Injectable } from '@angular/core';

import {
  Tree, Node, NodeDescription, NodeLocation,
  Validator, ValidationResult, Language
} from '../../shared/syntaxtree';

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
export class TreeEditorService {
  private _tree = new BehaviorSubject<Tree>(undefined);
  private _language = new BehaviorSubject<Language>(undefined);
  private _validationResult = new BehaviorSubject<ValidationResult>(ValidationResult.EMPTY);
  private _generatedCode = new BehaviorSubject<string>("");

  /**
   * @param desc The new tree that should be available in the editor.
   */
  replaceTree(tree: NodeDescription | Tree) {
    if (tree instanceof Tree) {
      this._tree.next(tree);
    } else {
      this._tree.next(new Tree(tree));
    }

    this.resetCaches();
  }

  /**
   * @param lang The new language to use
   */
  setLanguage(lang: Language) {
    this._language.next(lang);
    this.resetCaches();
  }

  /**
   * Resets everything that depends on the current tree and language.
   */
  private resetCaches() {
    this.resetValidation();
    this.resetGeneratedCode();
  }

  /**
   * Validates the current tree against the current language. Should be called after
   * the tree or the language has changed.
   */
  private resetValidation() {
    const lang = this._language.getValue();
    const tree = this._tree.getValue();
    if (tree && lang) {
      this._validationResult.next(lang.validateTree(this._tree.getValue()));
    } else {
      this._validationResult.next(ValidationResult.EMPTY);
    }
  }

  /**
   * Emits the current tree against the current language. Should be called after
   * the tree or the language has changed.
   */
  private resetGeneratedCode() {
    const lang = this._language.getValue();
    const tree = this._tree.getValue();
    if (tree && !tree.isEmpty && lang) {
      this._generatedCode.next(lang.emitTree(this._tree.getValue()));
    } else {
      this._generatedCode.next("");
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

    this.replaceTree(this.peekTree.replaceNode(loc, desc));
  }

  /**
   * Inserts the node at the given location.
   *
   * @param loc The location of the insertion.
   * @param desc The node to insert
   */
  insertNode(loc: NodeLocation, desc: NodeDescription) {
    console.log(`Inserting node at ${JSON.stringify(loc)}`, desc);

    this.replaceTree(this.peekTree.insertNode(loc, desc));
  }

  /**
   * Deletes the node at the given location.
   *
   * @param loc The location of the insertion.
   */
  deleteNode(loc: NodeLocation) {
    console.log(`Deleting node at ${JSON.stringify(loc)}`);

    this.replaceTree(this.peekTree.deleteNode(loc));
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

    this.replaceTree(this.peekTree.setProperty(loc, key, value));
  }

  /**
   * Adds a new property without specifying a value.
   *
   * @param loc The location of the node to edit.
   * @param key The name of the property.
   */
  addProperty(loc: NodeLocation, key: string) {
    console.log(`Adding ${JSON.stringify(loc)} property "${key}"`);

    this.replaceTree(this.peekTree.addProperty(loc, key));
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

    this.replaceTree(this.peekTree.renameProperty(loc, key, newKey));
  }

  /**
   * Adds an empty childgroup to the specified node.
   *
   * @param loc The location of the node to edit.
   * @param key The name of the child group.
   */
  addChildGroup(loc: NodeLocation, key: string) {
    console.log(`Adding empty childgroup "${key}" at ${JSON.stringify(loc)}`);

    this.replaceTree(this.peekTree.addChildGroup(loc, key));
  }

  /**
   * @return The tree that is currently edited.
   */
  get peekTree() {
    return (this._tree.getValue());
  }

  /**
   * @return An observable of the tree that is currently edited.
   */
  get currentTree(): Observable<Tree> {
    return (this._tree);
  }

  /**
   * @return The validation result for the tree that is currently beeing edited.
   */
  get currentValidationResult(): Observable<ValidationResult> {
    return (this._validationResult);
  }

  /**
   * @return The code that is currently emitted.
   */
  get currentGeneratedCode(): Observable<string> {
    return (this._generatedCode);
  }

  /**
   * @return The language that is currently in use.
   */
  get currentLanguage(): Observable<Language> {
    return (this._language);
  }
}
