import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, combineLatest, from } from 'rxjs'
import { tap, flatMap, map, filter } from 'rxjs/operators';

import { convertGrammarTreeInstructions } from '../shared/block/generator/generator-tree';
import { BlockLanguageDescription } from '../shared/block/block-language.description';
import { BlockLanguageDataService } from '../shared/serverdata';
import { ResourceReferencesService } from '../shared/resource-references.service';
import { BlockLanguage } from '../shared/block';
import { CodeResource, NodeLocation, Tree } from '../shared/syntaxtree';

import { ProjectService } from './project.service';
import { SidebarService } from './sidebar.service';
import { BlockDebugOptionsService } from './block-debug-options.service';

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

  private _blockLanguageCache: { [id: string]: BlockLanguage } = {};

  constructor(
    private _sidebarService: SidebarService,
    private _projectService: ProjectService,
    private _debugOptions: BlockDebugOptionsService,
    private _resourceReferences: ResourceReferencesService,
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

  /**
   * The block language that should be used to display the code resource.
   */
  readonly currentBlockLanguage: Observable<BlockLanguage> = combineLatest(
    this.resourceBlockLanguageId, this._debugOptions.showInternalAst.value$
  ).pipe(
    map(async ([blockLangId, showInternalAst]) => {
      debugger;
      const blockLang = await this._resourceReferences.getBlockLanguage(blockLangId);
      if (blockLang && showInternalAst) {
        return (this.getTreeBlockLanguage(blockLang.grammarId));
      } else {
        return (blockLang);
      }
    }),
    flatMap(p => p),
  );

  /**
   * Generates a block language on the fly to represent an AST for the grammar
   * with the given ID.
   *
   * @param grammarId The grammar to base the block language on.
   */
  private getTreeBlockLanguage(grammarId: string): BlockLanguage {
    // Was the block language for that grammar created already?
    if (!this._blockLanguageCache[grammarId]) {
      // Nope, we build it on the fly
      console.log(`Generating AST block language for grammar with ID "${grammarId}"`);

      const grammar = this._projectService.cachedProject.grammarDescriptions.find(g => g.id === grammarId);
      const blockLangModel = convertGrammarTreeInstructions({ type: "tree" }, grammar);
      const blockLangDesc: BlockLanguageDescription = Object.assign(blockLangModel, {
        id: grammarId,
        name: `Automatically generated from "${grammar.name}"`,
        defaultProgrammingLanguageId: grammar.programmingLanguageId
      });

      this._blockLanguageCache[grammarId] = new BlockLanguage(blockLangDesc);
    }

    return (this._blockLanguageCache[grammarId]);
  }

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
