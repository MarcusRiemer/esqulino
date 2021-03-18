import { Component } from "@angular/core";

import { map, tap } from "rxjs/operators";

import { QualifiedTypeName, NodeDescription } from "../../../shared/syntaxtree";
import { readFromNode } from "../../../shared/syntaxtree/meta-grammar/meta-grammar";
import {
  allConcreteTypes,
  getTypeList,
} from "../../../shared/syntaxtree/grammar-type-util";

import { DragService } from "../../drag.service";
import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { ProjectService } from "../../project.service";

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
    private _dragService: DragService,
    private _current: CurrentCodeResourceService,
    private _project: ProjectService
  ) {}

  readonly availableNodes = this._current.currentTree.pipe(
    map((t) => readFromNode(t.toModel())),
    map((g) => getTypeList(allConcreteTypes(g)))
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
