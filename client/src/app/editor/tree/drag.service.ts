import { Observable, BehaviorSubject } from 'rxjs'

import { Injectable } from '@angular/core'

import { arrayEqual } from '../../shared/util'
import { Node, NodeDescription, NodeLocation } from '../../shared/syntaxtree'

import { TrashService } from '../shared/trash.service'

import { TreeEditorService } from './editor.service'

/**
 * Serializable information that is attached to the drag
 */
export interface CurrentDragData {
  origin: "sidebar" | "tree"
  draggedDescription: NodeDescription
}

/**
 * Encapsulates instances that know about the origin of the drag. This
 * is important when moving or replacing nodes in the tree.
 */
export interface DragSource {
  location: NodeLocation,
  treeEditorService: TreeEditorService
}

/**
 * Manages state for everything involved dragging. This involves at least sidebars
 * and actual editors, but may very well extend to other pieces of UI.
 */
@Injectable()
export class DragService {
  private _currentDrag = new BehaviorSubject<CurrentDragData>(undefined);
  private _currentDragInProgress = this._currentDrag.map(d => !!d);

  // The node the operation originated from
  private _currentSource: DragSource;

  // The node the drag operation is currently dragged over.
  private _currentDragOverNode = new BehaviorSubject<Node>(undefined);

  // The placeholder the drag operation is currently dragged over
  private _currentDragOverPlaceholder = new BehaviorSubject<NodeLocation>(undefined);

  /**
   * This service is involved  with *every* part of the UI and must therefore
   * be attached to the very root of the dependency injection hierarchy. All
   * other services that may exist more then once may not be injected into
   * this service. They need to be passed as "normal" arguments of the existing
   * methods to ensure the correct instances get passed around.
   */
  private constructor(private _trashService: TrashService) { }

  /**
   * Starts a new dragging operation.
   * 
   * @param evt The original drag event that was issued by the DOM
   * @param drag The serializable drag information
   * @param source The node with the corresponding tree that started the drag
   */
  public dragStart(evt: DragEvent, drag: CurrentDragData, source?: DragSource) {
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

      // The current source needs to be "undefined" first because
      // the "peekIsDragInProgress" depends on it. And this property
      // may be checked when subscriptions of the following observables
      // are fired.
      this._currentSource = undefined;

      this._currentDragOverNode.next(undefined);
      this._currentDrag.next(undefined);
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
        console.log("Deleting");
        this._currentSource.treeEditorService.deleteNode(this._currentSource.location)
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

  /**
   * Needs to be called by nodes when the drag operation currently drags over any placeholder.
   */
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
  get peekIsDragInProgress(): boolean {
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
  get currentDragOverNode(): Observable<Node> {
    return (this._currentDragOverNode);
  }

  /**
   * @return Observable with the placeholder that is currently being dragged over.
   */
  get currentDragOverPlaceholder(): Observable<NodeLocation> {
    return (this._currentDragOverPlaceholder);
  }
}
