import { Component } from "@angular/core";

import { filter, map, shareReplay, switchMap } from "rxjs/operators";

import { QualifiedTypeName, NodeDescription } from "../../../shared/syntaxtree";
import { readFromNode } from "../../../shared/syntaxtree/meta-grammar/meta-grammar";
import {
  allConcreteTypes,
  allVisualisableTypes,
  allVisualisationTypes,
  getTypeList,
} from "../../../shared/syntaxtree/grammar-type-util";
import { ResourceReferencesService } from "../../../shared/resource-references.service";

import { DragService } from "../../drag.service";
import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { combineLatest } from "rxjs";
import produce from "immer";

/**
 * Create appropriate descriptions from the given typename
 */
function makeReferenceBlock(name: QualifiedTypeName): NodeDescription[] {
  return [
    {
      language: "MetaGrammar",
      name: "nodeRefOne",
      properties: {
        languageName: name.languageName,
        typeName: name.typeName,
      },
    },
  ];
}

@Component({
  templateUrl: "templates/defined-types-sidebar.html",
})
export class DefinedTypesSidebarComponent {
  constructor(
    private readonly _dragService: DragService,
    private readonly _current: CurrentCodeResourceService,
    private readonly _resourceReferences: ResourceReferencesService
  ) {}

  readonly editedGrammarDocument$ = this._current.currentTree.pipe(
    filter((t) => !t.isEmpty),
    map((t) => {
      try {
        return readFromNode(t.toModel(), true);
      } catch {
        return null;
      }
    }),
    filter((g) => !!g)
  );

  readonly referencedGrammars$ = this.editedGrammarDocument$.pipe(
    switchMap((g) =>
      Promise.all(
        [...(g.includes ?? []), ...(g.visualizes ?? [])].map((grammarId) =>
          this._resourceReferences.getGrammarDescription(grammarId)
        )
      )
    )
  );

  readonly fullGrammarDocument$ = combineLatest([
    this.editedGrammarDocument$,
    this.referencedGrammars$,
  ]).pipe(
    map(([edited, included]) => {
      if (included?.length === 1) {
        return produce(edited, (merged) => {
          merged.foreignTypes = allConcreteTypes(included[0]);
          merged.foreignVisualisations = allVisualisationTypes(included[0]);
        });
      } else {
        return edited;
      }
    })
  );

  readonly availableNodes$ = this.fullGrammarDocument$.pipe(
    map((g) => getTypeList(allConcreteTypes(g))),
    // Keep providing the last configuration that was known to work
    shareReplay(1)
  );

  printableName(n: QualifiedTypeName) {
    return n.languageName + "." + n.typeName;
  }

  /**
   * The user has decided to start dragging something from the sidebar.
   */
  startDrag(evt: DragEvent, name: QualifiedTypeName) {
    try {
      this._dragService.dragStart(evt, makeReferenceBlock(name));
    } catch (e) {
      alert(e);
    }
  }
}
