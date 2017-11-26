import { BehaviorSubject, Observable, Subscription } from 'rxjs'

import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import {
  CodeResource,
  Tree, Node, NodeDescription,
  Validator, ValidationResult
} from '../../shared/syntaxtree';

import { LanguageModel, AvailableLanguageModels } from '../../shared/block'
import { LanguageService } from '../../shared/language.service';

import { ProjectService, Project } from '../project.service';
import { SidebarService } from '../sidebar.service';

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

  private _currentTree: Observable<Tree> = Observable.of(undefined);

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
      this._codeResource.next(resource);
    });

    this._subscriptionRefs.push(subRef);
  }

  /**
   * Things that need to happen every time the resource changes
   */
  private readonly onResourceChange = this._codeResource
    .distinctUntilChanged()
    .filter(r => !!r)
    .do(r => {
      console.log("New resource!", r);

      // Show the new sidebar
      this._sidebarService.showSingleSidebar(TreeSidebarComponent.SIDEBAR_IDENTIFIER, r);

      // Reset all caches
      this.resetCaches();

      // Assign specific caches
      this._currentTree = this._codeResource.value.syntaxTree;
    })
    .subscribe();

  /**
   * Freeing all subscriptions
   */
  ngOnDestroy() {
    this._subscriptionRefs.forEach(ref => ref.unsubscribe());
    this._subscriptionRefs = [];
  }

  get currentResource(): Observable<CodeResource> {
    return (this._codeResource);
  }

  /**
   * Resets everything that depends on the current tree and language.
   */
  private resetCaches() {
    this.resetGeneratedCode();
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
    return (this.peekResource.syntaxTreePeek);
  }

  /**
   * @return The resource that is currently beeing edited.
   */
  get peekResource() {
    return (this._codeResource.value);
  }

  /**
   * @return The code that is currently emitted.
   */
  get currentGeneratedCode(): Observable<string> {
    return (this._generatedCode);
  }

  /**
   * @return The language that is used by the current language model
   */
  private get peekLanguage() {
    if (this.peekResource) {
      const languageModel = this._languageService.getLanguageModel(this.peekResource.languageIdPeek);
      return (languageModel.language);
    } else {
      return (undefined);
    }
  }
}
