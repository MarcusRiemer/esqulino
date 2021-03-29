import { Component } from "@angular/core";

import { Observable, combineLatest } from "rxjs";
import { map, switchMap } from "rxjs/operators";

import * as Apollo from "apollo-angular";

import { BlockLanguage } from "../../../shared/block";
import { ResourceReferencesService } from "../../../shared/resource-references.service";
import { convertGrammarTreeInstructions } from "../../../shared/block/generator/generator-tree";
import { IndividualGrammarDataService } from "../../../shared/serverdata";

import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { DragService } from "../../drag.service";
import { BlockDebugOptionsService } from "../../block-debug-options.service";
import { ProjectService } from "../../project.service";
import {
  FullBlockLanguageDocument,
  FullBlockLanguageQuery,
} from "src/generated/graphql";
import { BlockLanguageDescription } from "src/app/shared/block/block-language.description";
import { cacheFullBlockLanguage } from "src/app/shared/serverdata/gql-cache";

/**
 * Root of a block editor. Displays either the syntaxtree or a friendly message to
 * start programming.
 */
@Component({
  templateUrl: "templates/block-root.html",
})
export class BlockRootComponent {
  constructor(
    private _currentCodeResource: CurrentCodeResourceService,
    private _dragService: DragService,
    private _debugOptions: BlockDebugOptionsService,
    private _resourceReferences: ResourceReferencesService,
    private _projectService: ProjectService,
    private _grammarData: IndividualGrammarDataService,
    private _apollo: Apollo.Apollo
  ) {}

  /**
   * When something draggable enters the empty area a program may start with,
   * there is not actually a node that could be referenced.
   */
  public onPlaceholderDragEnter(evt: MouseEvent) {
    if (this._dragService.peekIsDragInProgress) {
      this._dragService.informDraggedOver(evt, [], undefined, {
        allowExact: true,
      });
    }
  }

  /**
   * @return The resource that is currently edited
   */
  readonly currentResource$ = this._currentCodeResource.currentResource;

  readonly validationContext = this._projectService.activeProject.pipe(
    map((p) => p.additionalValidationContext)
  );

  /**
   * The block language that should be used to display the code resource.
   */
  readonly currentBlockLanguage$: Observable<BlockLanguage> = combineLatest([
    this._currentCodeResource.resourceBlockLanguageId,
    this._debugOptions.showEditableAst.value$,
  ]).pipe(
    map(async ([blockLangId, showInternalAst]) => {
      const blockLang = await this._resourceReferences.getBlockLanguage(
        blockLangId,
        { onMissing: "undefined" }
      );
      if (!blockLang) {
        throw new Error(
          `BlockRootComponent could not resolve BlockLanguage with id "${blockLangId}"`
        );
      }
      if (showInternalAst) {
        return this.getTreeBlockLanguage(blockLang.grammarId);
      } else {
        return blockLang;
      }
    }),
    // Unwrap Promise from previous step
    switchMap((b) => b)
  );

  /**
   * Generates a block language on the fly to represent an AST for the grammar
   * with the given ID.
   *
   * @param grammarId The grammar to base the block language on.
   */
  private async getTreeBlockLanguage(
    grammarId: string
  ): Promise<BlockLanguage> {
    // If a block language exists for the given grammar ID: This language
    // was automatically generated for that grammar.
    let blockLang = await this._resourceReferences.getBlockLanguage(grammarId, {
      fetchPolicy: "cache-only",
      onMissing: "undefined",
    });
    // Was the block language for that grammar created already?
    if (!blockLang) {
      // Nope, we build it on the fly
      console.log(
        `Generating AST block language for grammar with ID "${grammarId}"`
      );

      // There is a possibility that the grammar hasn't been loaded yet.
      const grammar = await this._grammarData.getLocal(grammarId, "request");
      const blockLangModel = convertGrammarTreeInstructions(
        { type: "tree" },
        grammar
      );

      const blockLangDesc: FullBlockLanguageQuery["blockLanguage"] = {
        __typename: "BlockLanguage",
        id: grammarId,
        grammarId: grammarId,
        name: `Automatically generated from "${grammar.name}"`,
        defaultProgrammingLanguageId: grammar.programmingLanguageId,
        sidebars: blockLangModel.sidebars,
        editorBlocks: blockLangModel.editorBlocks,
        editorComponents: blockLangModel.editorComponents,
        rootCssClasses: blockLangModel.rootCssClasses,
        createdAt: Date(),
        updatedAt: Date(),
      };

      cacheFullBlockLanguage(this._apollo, blockLangDesc);

      return new BlockLanguage(blockLangDesc);
    } else {
      return blockLang;
    }
  }
}
