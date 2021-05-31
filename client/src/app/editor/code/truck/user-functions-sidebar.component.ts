import { Component } from "@angular/core";

import { flatMap, map } from "rxjs/operators";
import { QualifiedTypeName, NodeDescription } from "../../../shared/syntaxtree";

import { DragService } from "../../drag.service";
import { CurrentCodeResourceService } from "../../current-coderesource.service";

/**
 * This is the typename according to the grammar. If it ever changes on the
 * server it needs to be replicated over here.
 */
const GRAMMAR_PROCEDURE_DECLARATION: QualifiedTypeName = {
  languageName: "trucklino_program",
  typeName: "procedureDeclaration",
};

/**
 * A procedure that was declared in the currently available program.
 */
interface AvailableProcedure {
  name: string;
}

/**
 * Create appropriate descriptions from the available procedure
 */
function makeCallBlock(proc: AvailableProcedure): NodeDescription[] {
  return [
    {
      language: "trucklino_program",
      name: "procedureCall",
      properties: {
        name: proc.name,
      },
    },
  ];
}

@Component({
  templateUrl: "templates/user-functions-sidebar.html",
})
export class UserFunctionsSidebarComponent {
  constructor(
    private _dragService: DragService,
    private _current: CurrentCodeResourceService
  ) {}

  get name() {
    return this._current.peekResource.name;
  }

  readonly availableProcedures = this._current.currentResource.pipe(
    flatMap((res) => res.syntaxTree$),
    map((tree): AvailableProcedure[] => {
      const nodes = tree.getNodesOfType(GRAMMAR_PROCEDURE_DECLARATION);
      return nodes.map((n): AvailableProcedure => {
        return { name: n.properties["name"] };
      });
    })
  );

  readonly hasAvailableProcedures = this.availableProcedures.pipe(
    map((nodes) => nodes.length > 0)
  );

  /**
   * The user has decided to start dragging something from the sidebar.
   */
  startDrag(evt: DragEvent, proc: AvailableProcedure) {
    try {
      this._dragService.dragStart(evt, makeCallBlock(proc));
    } catch (e) {
      alert(e);
    }
  }
}
