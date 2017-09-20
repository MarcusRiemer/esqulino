import { Injectable } from '@angular/core'

import { BehaviorSubject } from 'rxjs/BehaviorSubject'

import { TrashService } from '../shared/trash.service'

import { Node, NodeDescription } from '../../shared/syntaxtree'

export interface CurrentDrag {
  origin: "sidebar" | "tree"
  node: NodeDescription
}

@Injectable()
export class DragService {
  private _currentDrag = new BehaviorSubject<CurrentDrag>(undefined);

  private _currentSource: Node;

  private constructor(private _trashService: TrashService) { }

  public dragStart(evt: DragEvent, drag: CurrentDrag, source?: Node) {
    if (this._currentDrag.value || this._currentSource) {
      throw new Error("Attempted to start a second drag");
    }

    console.log(evt);

    // We are only interested in the top level drag element, if
    // we wouldn't stop the propagation, the parent of the current
    // drag element would fire another dragstart.
    evt.stopPropagation();

    // Serialize the dragged "thing"
    const dragData = JSON.stringify(drag);
    evt.dataTransfer.setData('text/plain', dragData);

    //
    evt.dataTransfer.effectAllowed = "move";

    // Reset everything once the operation has ended
    const dragEndHandler = () => {
      evt.target.removeEventListener("dragend", dragEndHandler);

      this._currentDrag.next(undefined);
      this._currentSource = undefined;
      this._trashService.hideTrash();
      console.log(`AST-Drag ended:`, drag);
    }
    evt.target.addEventListener("dragend", dragEndHandler);


    // Store drag information as long as this drags on
    this._currentDrag.next(drag);
    this._currentSource = source;

    // If we have a proper source: Wire it up to react to
    // being put in the trash.
    if (source) {
      this._trashService.showTrash(_ => {
        alert("remove");
      });
    }
    console.log(`AST-Drag started:`, drag);
  }
}
