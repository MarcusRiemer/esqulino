import { Observable, BehaviorSubject } from 'rxjs'

import { Injectable } from '@angular/core'

import { arrayEqual } from '../../shared/util'
import { Node, NodeDescription, NodeLocation } from '../../shared/syntaxtree'

import { TrashService } from '../shared/trash.service'

export interface CurrentDrag {
  origin: "sidebar" | "tree"
  draggedDescription: NodeDescription
}

/**
 * Manages state for everything involved dragging.
 */
@Injectable()
export class DragService {
  private _currentDrag = new BehaviorSubject<CurrentDrag>(undefined);
  private _currentDragInProgress = this._currentDrag.map(d => !!d);

  // The node the operation originated from
  private _currentSource: Node;

  // The node the drag operation is currently dragged over.
  private _currentDragOverNode = new BehaviorSubject<Node>(undefined);

  // The placeholder the drag operation is currently dragged over
  private _currentDragOverPlaceholder = new BehaviorSubject<NodeLocation>(undefined);

  private constructor(private _trashService: TrashService) { }

  public dragStart(evt: DragEvent, drag: CurrentDrag, source?: Node) {
    if (this._currentDrag.value || this._currentSource) {
      throw new Error("Attempted to start a second drag");
    }

    // We are only interested in the top level drag element, if
    // we wouldn't stop the propagation, the parent of the current
    // drag element would fire another dragstart.
    evt.stopPropagation();

    // Serialize the dragged "thing"
    const dragData = JSON.stringify(drag);
    evt.dataTransfer.setData('text/plain', dragData);

    // TODO: Choose when to move and when to copy
    evt.dataTransfer.effectAllowed = "move";

    // Reset everything once the operation has ended
    const dragEndHandler = () => {
      evt.target.removeEventListener("dragend", dragEndHandler);

      this._currentDrag.next(undefined);
      this._currentDragOverNode.next(undefined);
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

  /**
   * Needs to be called by nodes when the drag operation currently drags over any node.
   */
  public informDraggedOverNode(node: Node) {
    if (this._currentDragOverNode.getValue() != node) {
      this._currentDragOverPlaceholder.next(undefined);
      this._currentDragOverNode.next(node);
    }
    console.log("Dragged over node:", node ? JSON.stringify(node.location) : "editor");
  }

  public informDraggedOverPlaceholder(loc: NodeLocation) {
    if (!arrayEqual(this._currentDragOverPlaceholder.getValue(), loc)) {
      this._currentDragOverPlaceholder.next(loc);
      this._currentDragOverNode.next(undefined);
    }
    console.log("Dragged over placeholder:", JSON.stringify(this._currentDragOverPlaceholder.getValue()));
  }

  /**
   * @return Observable to always know the current (very general)y state of drag affairs.
   */
  get isDragInProgress() {
    return (this._currentDragInProgress.distinctUntilChanged());
  }

  /**
   * @return Takes a peek whether a drag is occuring *right now*.
   */
  get peekIsDragInProgress() {
    return (!!this._currentDrag.getValue());
  }

  /**
   * @return Takes a peek at the data of the drag that is occuring *right now*.
   */
  get peekDragData() {
    return (this._currentDrag.getValue());
  }

  /**
   * @return Observable with the node that is currently dragged over.
   */
  get currentDragOverNode() {
    return (this._currentDragOverNode);
  }

  get currentDragOverPlaceholder() {
    return (this._currentDragOverPlaceholder);
  }
}
