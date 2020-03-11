import { Component } from '@angular/core';

import { map } from 'rxjs/operators';

import { QualifiedTypeName, NodeDescription } from '../../../shared/syntaxtree';
import { DragService } from '../../drag.service';
import { CurrentCodeResourceService } from '../../current-coderesource.service';

/**
 * Create appropriate descriptions from the given typename
 */
function makeReferenceBlock(name: QualifiedTypeName): NodeDescription[] {
  return ([
    {
      language: "MetaGrammar",
      name: "nodeRefOne",
      properties: {
        "languageName": name.languageName,
        "typeName": name.typeName
      }
    }
  ]);
}

@Component({
  templateUrl: 'templates/defined-types-sidebar.html',
})
export class DefinedTypesSidebarComponent {
  constructor(
    private _dragService: DragService,
    private _current: CurrentCodeResourceService
  ) {
  }

  readonly availableNodes = this._current.currentTree.pipe(
    map(
      t => {
        const concrete = t.getNodesOfType({ languageName: "MetaGrammar", typeName: "concreteNode" });
        const typedefs = t.getNodesOfType({ languageName: "MetaGrammar", typeName: "typedef" });

        return (
          [...concrete, ...typedefs])
          .map((n): QualifiedTypeName => {
            return ({
              languageName: n.properties["languageName"],
              typeName: n.properties["typeName"]
            });
          }
          );
      }),
  );

  printableName(n: QualifiedTypeName) {
    return (n.languageName + "." + n.typeName);
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