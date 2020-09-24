import { ComponentPortal } from "@angular/cdk/portal";
import { Component } from "@angular/core";

import { Observable, combineLatest } from "rxjs";
import { flatMap, map } from "rxjs/operators";

import {
  FixedBlocksSidebar,
  FixedBlocksSidebarDescription,
  SidebarDescription,
} from "../../shared/block";
import { generateSidebar } from "../../shared/block/generator/sidebar";
import { ResourceReferencesService } from "../../shared/resource-references.service";
import { IndividualGrammarDataService } from "../../shared/serverdata";
import { allPresentTypes } from "../../shared/syntaxtree/grammar-type-util";

import { CurrentCodeResourceService } from "../current-coderesource.service";

import { CodeSidebarFixedBlocksComponent } from "./code-sidebar-fixed-blocks.component";
import { DefinedTypesSidebarComponent } from "./meta/defined-types.sidebar.component";
import { DatabaseSchemaSidebarComponent } from "./query/database-schema-sidebar.component";
import { UserFunctionsSidebarComponent } from "./truck/user-functions-sidebar.component";
import { TruckWorldTilesSidebarComponent } from "./truck/world-editor/truck-world-tiles-sidebar.component";

/**
 * Maps ids of sidebar components to their actual components.
 */
function resolvePortalComponentId(id: SidebarDescription["type"]): any {
  switch (id) {
    case "fixedBlocks":
      return CodeSidebarFixedBlocksComponent;
    case "databaseSchema":
      return DatabaseSchemaSidebarComponent;
    case "truckProgramUserFunctions":
      return UserFunctionsSidebarComponent;
    case "metaDefinedTypes":
      return DefinedTypesSidebarComponent;
    case "truckWorldTiles":
      return TruckWorldTilesSidebarComponent;
  }
}

/**
 * The sidebar hosts elements that can be dragged onto the currently active
 * query. Additionally it sometimes offers a "trashcan" where items can be
 * dropped if they are meant to be deleted.
 */
@Component({
  templateUrl: "templates/code-sidebar.html",
  selector: "code-sidebar",
})
export class CodeSidebarComponent {
  /**
   * This ID is used to register this sidebar with the sidebar loader
   */
  public static get SIDEBAR_IDENTIFIER() {
    return "tree";
  }

  constructor(
    private _currentCodeResource: CurrentCodeResourceService,
    private _resourceReferences: ResourceReferencesService,
    private _grammarData: IndividualGrammarDataService
  ) {}

  readonly currentCodeResource$ = this._currentCodeResource.currentResource;

  readonly currentBlockLanguageId$ = this.currentCodeResource$.pipe(
    flatMap((res) => res.blockLanguageId)
  );

  readonly hasBlockLanguage$ = this.currentBlockLanguageId$.pipe(
    flatMap((id) =>
      this._resourceReferences.ensureResources({ type: "blockLanguage", id })
    )
  );

  /**
   * The block language that is currently in use.
   */
  readonly currentBlockLanguage$ = this.currentBlockLanguageId$.pipe(
    map((id) => this._resourceReferences.getBlockLanguage(id, "throw"))
  );

  private readonly _fallbackSidebarDescription$: Observable<
    FixedBlocksSidebarDescription
  > = this.currentBlockLanguage$.pipe(
    flatMap((b) => this._grammarData.getLocal(b.grammarId, "request")),
    map((g) => {
      // Extract the types that can be generated meaningfully
      const toGenerate: { [grammarName: string]: string[] } = {};
      const allTypes = allPresentTypes(g, (t) => t.type === "concrete");
      Object.entries(allTypes).forEach(([name, types]) => {
        toGenerate[name] = [...Object.keys(types)];
      });
      return generateSidebar(allTypes, {
        type: "generatedBlocks",
        caption: "Auto Generated",
        categories: [
          {
            type: "generated",
            categoryCaption: g.name,
            grammar: toGenerate,
          },
        ],
      });
    })
  );

  readonly fallbackSidebar$: Observable<FixedBlocksSidebar> = combineLatest(
    this.currentBlockLanguage$,
    this._fallbackSidebarDescription$
  ).pipe(map(([b, desc]) => new FixedBlocksSidebar(b, desc)));

  /**
   * The actual sidebars that need to be spawned for the current language.
   */
  readonly portalInstances$ = this.currentBlockLanguage$.pipe(
    map((blockLanguage) =>
      blockLanguage.sidebars.map((s) => {
        return new ComponentPortal(
          resolvePortalComponentId(s.portalComponentTypeId)
        );
      })
    )
  );
}
