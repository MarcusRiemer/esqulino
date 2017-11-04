import { BehaviorSubject, Observable } from 'rxjs'

import { Injectable } from '@angular/core';

import {
  CodeResource,
  Tree, Node, NodeDescription,
  Validator, ValidationResult, Language
} from '../../shared/syntaxtree';

/**
 * This service represents a single code resource that is currently beeing
 * edited. It is meant to be instanciated by every tree editor
 * to be available in all node components of that editor.
 */
@Injectable()
export class TreeEditorService {
  private _codeResource = new BehaviorSubject<CodeResource>(undefined);
  private _language = new BehaviorSubject<Language>(undefined);

  private _validationResult = new BehaviorSubject<ValidationResult>(ValidationResult.EMPTY);
  private _generatedCode = new BehaviorSubject<string>("");

  /**
   * @param res The code resource that is beeing edited.
   */
  set codeResource(res: CodeResource) {
    this._codeResource.next(res);
    this.resetCaches();
  }

  /**
   * @param desc The new tree that should be available in the editor.
   */
  replaceTree(tree: NodeDescription | Tree) {
    this.peekResource.replaceSyntaxTree(tree);
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
    if (this.peekResource && this.peekLanguage) {
      this._validationResult.next(this.peekLanguage.validateTree(this.peekTree));
    } else {
      this._validationResult.next(ValidationResult.EMPTY);
    }
  }

  /**
   * Emits the current tree against the current language. Should be called after
   * the tree or the language has changed.
   */
  private resetGeneratedCode() {
    if (this.peekResource && !this.peekTree.isEmpty && this.peekLanguage) {
      this._generatedCode.next(this.peekLanguage.emitTree(this.peekTree));
    } else {
      this._generatedCode.next("");
    }
  }

  /**
   * @return The tree that is currently edited.
   */
  get peekTree() {
    return (this._codeResource.value.syntaxTree);
  }

  /**
   * @return The resource that is currently beeing edited.
   */
  get peekResource() {
    return (this._codeResource.value);
  }

  /**
   * @return An observable of the tree that is currently edited.
   */
  get currentTree(): Observable<Tree> {
    return (this._codeResource.value.obsSyntaxTree);
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
   * @param lang The new language to use
   */
  setLanguage(lang: Language) {
    if (this.peekResource) {
      this.peekResource.languageId = lang.id;
    }
    this._language.next(lang);
    this.resetCaches();
  }

  /**
   * @return The language that is currently in use.
   */
  get currentLanguage(): Observable<Language> {
    return (this._language);
  }

  get peekLanguage(): Language {
    return (this._language.value);
  }
}
