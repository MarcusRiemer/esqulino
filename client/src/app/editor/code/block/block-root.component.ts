import { Component } from '@angular/core';

import { Observable, combineLatest } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';

import { BlockLanguage } from '../../../shared/block';
import { ResourceReferencesService } from '../../../shared/resource-references.service';
import { convertGrammarTreeInstructions } from '../../../shared/block/generator/generator-tree';
import { BlockLanguageDescription } from '../../../shared/block/block-language.description';

import { CurrentCodeResourceService } from '../../current-coderesource.service';
import { DragService } from '../../drag.service';
import { BlockDebugOptionsService } from '../../block-debug-options.service';
import { ProjectService } from '../../project.service';

/**
 * Root of a block editor. Displays either the syntaxtree or a friendly message to
 * start programming.
 */
@Component({
  templateUrl: 'templates/block-root.html',
})
export class BlockRootComponent {
  private _blockLanguageCache: { [id: string]: BlockLanguage } = {};


  constructor(
    private _currentCodeResource: CurrentCodeResourceService,
    private _dragService: DragService,
    private _debugOptions: BlockDebugOptionsService,
    private _resourceReferences: ResourceReferencesService,
    private _projectService: ProjectService,
  ) {
  }

  /**
   * When something draggable enters the empty area a program may start with,
   * there is not actually a node that could be referenced.
   */
  public onPlaceholderDragEnter(evt: MouseEvent) {
    if (this._dragService.peekIsDragInProgress) {
      this._dragService.informDraggedOver(evt, [], undefined, {
        allowExact: true
      });
    }
  }

  /**
   * @return The resource that is currently edited
   */
  readonly currentResource$ = this._currentCodeResource.currentResource;

  /**
   * The block language that should be used to display the code resource.
   */
  readonly currentBlockLanguage$: Observable<BlockLanguage> = combineLatest(
    this._currentCodeResource.resourceBlockLanguageId,
    this._debugOptions.showInternalAst.value$
  ).pipe(
    map(([blockLangId, showInternalAst]) => {
      const blockLang = this._resourceReferences.getBlockLanguage(blockLangId, "undefined");
      if (blockLang && showInternalAst) {
        return (this.getTreeBlockLanguage(blockLang.grammarId));
      } else {
        return (blockLang);
      }
    }),
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
}