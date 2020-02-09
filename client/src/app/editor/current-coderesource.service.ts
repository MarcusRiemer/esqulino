import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, combineLatest } from 'rxjs'
import { tap, flatMap, map, filter } from 'rxjs/operators';

import { ResourceReferencesService } from '../shared/resource-references.service';
import { CodeResource, NodeLocation, Tree, ValidationResult } from '../shared/syntaxtree';
import { BlockLanguageDataService, GrammarDataService } from '../shared/serverdata';

import { ProjectService } from './project.service';
import { SidebarService } from './sidebar.service';

// TODO: Promote the new sidebar system
import { CodeSidebarComponent } from './code/code.sidebar'


/**
 * This service represents a single code resource that is currently beeing
 * edited. It glues together the actual resource that is beeing edited and
 * enables components like the validator and the compiler to automatically
 * do their work.
 */
@Injectable()
export class CurrentCodeResourceService {
  /**
   * The resource that is currently edited.
   */
  private _codeResource = new BehaviorSubject<CodeResource>(undefined);

  private _executionLocation = new BehaviorSubject<NodeLocation>(undefined);

  constructor(
    private _sidebarService: SidebarService,
    private _projectService: ProjectService,
    private _resourceReferences: ResourceReferencesService,
    private _blockLanguageData: BlockLanguageDataService,
    private _grammarData: GrammarDataService,
  ) {
    // Things that need to happen every time the resource changes
    this._codeResource
      .pipe(
        tap(r => {
          if (r) {
            // Show the new sidebar
            console.log("Sidebar change because of current code resource");
            this._sidebarService.showSingleSidebar(CodeSidebarComponent.SIDEBAR_IDENTIFIER, r);
          }
        })
      )
      .subscribe();
  }

  /**
   * Allows to change the resource that is currently displayed.
   *
   * @remarks This is meant to be updated in conjunction with the URL.
   */
  _changeCurrentResource(codeResourceId: string) {
    // Knowing when resources change is handy for debugging
    console.log(`Current resource ID changed to: ${codeResourceId}`);

    // Check whether the referenced resource exists
    if (codeResourceId) {
      // Yes, we resolve the actual resource
      const resource = this._projectService.cachedProject.getCodeResourceById(codeResourceId);
      console.log(`Set new resource "${resource.name}" (${codeResourceId})`);
      this._codeResource.next(resource);
    } else {
      // No, we inform everybody that there is no resource
      this._codeResource.next(undefined);
    }
  }

  /**
   * Informs interested components about the current resource.
   */
  readonly currentResource: Observable<CodeResource> = this._codeResource;

  /**
   * Informs interested components about the tree behind the current resource
   */
  readonly currentTree: Observable<Tree> = this._codeResource.pipe(
    filter(c => !!c),
    flatMap(c => c.syntaxTree)
  );

  /**
   * The block language that is configured on the resource.
   */
  readonly resourceBlockLanguageId: Observable<string> = this.currentResource.pipe(
    flatMap(c => c.blockLanguageId)
  );

  readonly blockLanguageGrammar = this.currentResource.pipe(
    flatMap(r => r.blockLanguageId),
    flatMap(id => this._blockLanguageData.getLocal(id, "request")),
    flatMap(b => this._grammarData.getLocal(b.grammarId, "request")),
  );

  /**
   * @return The latest validation result for this resource.
   */
  readonly validationResult = combineLatest(
    this.currentTree,
    this._projectService.activeProject,
    this.blockLanguageGrammar
  )
    .pipe(
      map(
        ([tree, project, grammar]) => {
          if (tree) {
            const validator = this._resourceReferences.getValidator(
              this.peekResource.emittedLanguageIdPeek, grammar.id
            );
            return (validator.validateFromRoot(tree, project.additionalValidationContext));
          } else {
            return (ValidationResult.EMPTY);
          }
        })
    );

  /**
   *
   */
  readonly currentExecutionLocation: Observable<NodeLocation> = this._executionLocation;

  /**
   * The currently loaded resource
   */
  get peekResource() {
    return (this._codeResource.value);
  }

  /**
   * Broadcasts a new execution location.
   */
  setCurrentExecutionLocation(loc?: NodeLocation) {
    this._executionLocation.next(loc);
  }
}
