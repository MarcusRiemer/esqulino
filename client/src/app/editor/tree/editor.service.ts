import { BehaviorSubject, Observable, Subscription } from 'rxjs'

import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import {
  CodeResource,
  Tree, Node, NodeDescription,
  Validator, ValidationResult
} from '../../shared/syntaxtree';

import { LanguageModel, AvailableLanguageModels } from '../../shared/block'

import { ProjectService, Project } from '../project.service';
import { SidebarService } from '../sidebar.service';

import { LanguageService } from './language.service';
import { TreeSidebarComponent } from './tree.sidebar';

/**
 * This service represents a single code resource that is currently beeing
 * edited. It is meant to be instanciated by every tree editor
 * to be available in all components of that editor.
 *
 * It glues together the actual resource that is beeing edited and ensures
 * that updates to that resource are validated and compiled.
 */
@Injectable()
export class TreeEditorService implements OnInit, OnDestroy {
  /**
   * Subscriptions that need to be released
   */
  private _subscriptionRefs: any[] = [];

  /**
   * The resource that is currently edited.
   */
  private _codeResource = new BehaviorSubject<CodeResource>(undefined);
  /**
   * The subscription to the currently edited resource. This needs
   * to be released if the resource changes.
   */
  private _codeResourceSub: Subscription;

  private _languageModelObs = this._codeResource.map(r => {
    if (r) {
      return (this._languageService.getLanguageModel(r.languageId));
    } else {
      return (undefined);
    }
  });

  private _validationResult = new BehaviorSubject<ValidationResult>(ValidationResult.EMPTY);
  private _generatedCode = new BehaviorSubject<string>("");

  constructor(
    private _sidebarService: SidebarService,
    private _routeParams: ActivatedRoute,
    private _projectService: ProjectService,
    private _languageService: LanguageService,
  ) {
    this.ngOnInit();
  }

  /**
   * It appears that services don't actually follow lifecycle hooks, so this
   * is called manually from the constructor.
   */
  ngOnInit(): void {
    // Listen for changes in the current route to extract the resource
    let subRef = this._routeParams.params.subscribe(params => {
      // Ensure the referenced resource exists
      const codeResourceId = params['resourceId'];
      if (!codeResourceId) {
        throw new Error(`Invalid code resource: "${codeResourceId}"`);
      }

      // Assign the resource and a matching language
      const resource = this._projectService.cachedProject.getCodeResourceById(codeResourceId);

      this.setCodeResource(resource);
      this.setLanguageModel(this._languageService.getLanguageModel(resource.languageId));

      // Create the new sidebar
      this._sidebarService.showSingleSidebar(TreeSidebarComponent.SIDEBAR_IDENTIFIER, this);
    });

    this._subscriptionRefs.push(subRef);
  }

  /**
   * Freeing all subscriptions
   */
  ngOnDestroy() {
    this._subscriptionRefs.forEach(ref => ref.unsubscribe());
    this._subscriptionRefs = [];
  }

  /**
   * @param res The code resource that is beeing edited.
   */
  private setCodeResource(res: CodeResource) {
    // Do we have any previous subscription? If so, it needs to be cancelled
    if (this._codeResourceSub) {
      this._codeResourceSub.unsubscribe();
    }

    // Assign the new resource 
    this._codeResource.next(res);
    this.resetCaches();

    // Also reset the cache every time that tree changes
    this._codeResourceSub = this.peekResource.obsSyntaxTree.subscribe(tree => {
      console.log("Cache reset", tree)
      this.resetCaches();
    });
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
      try {
        const tree = this.peekTree;

        this._validationResult.next(this.peekLanguage.validateTree(this.peekTree));
      } catch (e) {
        console.log(e);
      }
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
      try {
        this._generatedCode.next(this.peekLanguage.emitTree(this.peekTree));
      } catch (e) {
        this._generatedCode.next("Error: " + JSON.stringify(e));
      }
    } else {
      this._generatedCode.next("");
    }
  }

  /**
   * @return The tree that is currently edited.
   */
  private get peekTree() {
    return (this.peekResource.syntaxTree);
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
    return (this.peekResource.obsSyntaxTree);
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
   * @param lang The new LanguageModel to use
   */
  setLanguageModel(lang: LanguageModel) {
    this.peekResource.languageId = lang.id;
    this.resetCaches();
  }

  /**
   * @return The languagemodel that is currently in use.
   */
  get currentLanguageModel(): Observable<LanguageModel> {
    return (this._languageModelObs);
  }

  /**
   * @return The language that is used by the current language model
   */
  get peekLanguage() {
    if (this.peekResource) {
      const languageModel = this._languageService.getLanguageModel(this.peekResource.languageId);
      return (languageModel.language);
    } else {
      return (undefined);
    }
  }
}
