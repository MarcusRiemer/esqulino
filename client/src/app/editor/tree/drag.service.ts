import { Observable, BehaviorSubject } from 'rxjs'

import { Injectable } from '@angular/core'

import { arrayEqual } from '../../shared/util'
import { Node, NodeDescription, NodeLocation } from '../../shared/syntaxtree'
import { SidebarBlock } from '../../shared/block'

import { TrashService } from '../shared/trash.service'

import { TreeEditorService } from './editor.service'

/**
 * All information about the origin of this drag if it came from
 * the sidebar.
 */
export interface DragSidebar {
  sidebarBlockDescription: SidebarBlock
}

/**
 * All information about the origin of this drag if it came from
 * the tree itself. This is important when moving or replacing
 * nodes in the tree.
 */
export interface DragTree {
  node: Node,
  treeEditorService: TreeEditorService
}

/**
 * Groups together everything that might be of interest for a hovering
 * item.
 */
export interface CurrentDrag {
  // The node that is currently hovered over.
  hoverNode?: Node;
  // The placeholder that is currently hovered over
  hoverPlaceholder?: NodeLocation;
  // The JSON representation of the thing that is currently beeing dragged
  draggedDescription: NodeDescription;
  // The node in the tree that is currently beeing dragged
  treeSource?: DragTree;
  // The node of the sidebar that is currently beeing dragged
  sidebarSource?: DragSidebar;
}

/**
 * Manages state for everything involved dragging. This involves at least sidebars
 * and actual editors, but may very well extend to other pieces of UI.
 */
@Injectable()
export class DragService {
  // The thing we are currently dragging, including the complete hovering
  // state and everything that may be of concern.
  private _currentDrag = new BehaviorSubject<CurrentDrag>(undefined);

  // Shortcut to get the gist of the current drag process
  private _currentDragInProgress = this._currentDrag.map(d => !!d);

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
   * @param sourceSidebar The serializable drag information
   * @param sourceTree The node with the corresponding tree that started the drag
   */
  public dragStart(evt: DragEvent, desc: NodeDescription, sourceSidebar?: DragSidebar, sourceTree?: DragTree) {
    if (this._currentDrag.value) {
      throw new Error("Attempted to start a second drag");
    }

    // We are only interested in the top level drag element, if
    // we wouldn't stop the propagation, the parent of the current
    // drag element would fire another dragstart.
    evt.stopPropagation();

    // Serialize the dragged "thing"
    const domDragData = JSON.stringify(desc);
    evt.dataTransfer.setData('text/plain', domDragData);

    // TODO: Choose when to move and when to copy
    evt.dataTransfer.effectAllowed = "move";

    // Reset everything once the operation has ended
    const dragEndHandler = () => {
      evt.target.removeEventListener("dragend", dragEndHandler);

      this._currentDrag.next(undefined);
      this._trashService.hideTrash();
      console.log(`AST-Drag ended:`, sourceSidebar);
    }
    evt.target.addEventListener("dragend", dragEndHandler);

    // Store drag information as long as this drags on
    const hoverData = {
      draggedDescription: desc,
    } as CurrentDrag;

    if (sourceSidebar) {
      hoverData.sidebarSource = sourceSidebar;
    }

    if (sourceTree) {
      hoverData.treeSource = sourceTree;
    }

    this._currentDrag.next(hoverData);

    // If we have a proper source: Wire it up to react to
    // being put in the trash.
    if (sourceTree) {
      this._trashService.showTrash(_ => {
        console.log("Deleting");
        sourceTree.treeEditorService.peekResource.deleteNode(sourceTree.node.location)
      });
    }
    console.log(`AST-Drag started:`, sourceSidebar);
  }

  /**
   * Needs to be called by nodes when the drag operation currently drags over any node.
   */
  public informDraggedOverNode(node: Node) {
    const dragData = this._currentDrag.value;
    if (!dragData) {
      throw new Error("Can't drag over node: No drag in progress");
    }

    // Just in case: Get rid of a possibly set placeholder    
    delete dragData.hoverPlaceholder;
    // Overwrite the current node
    dragData.hoverNode = node;

    this._currentDrag.next(dragData);
    console.log("Dragged over node:", JSON.stringify(node.location));
  }

  /**
   * Needs to be called by nodes when the drag operation currently drags over any placeholder.
   */
  public informDraggedOverPlaceholder(loc: NodeLocation) {
    const dragData = this._currentDrag.value;
    if (!dragData) {
      throw new Error("Can't drag over placeholder: No drag in progress");
    }

    // Just in case: Get rid of a possibly set node    
    delete dragData.hoverNode;
    // Overwrite the current placeholder
    dragData.hoverPlaceholder = loc;

    this._currentDrag.next(dragData);
    console.log("Dragged over placeholder:", JSON.stringify(loc));
  }

  /**
   * Needs to be called when the drag operation currently drags over the editor.
   */
  public informDraggedOverEditor() {
    const dragData = this._currentDrag.value;
    if (!dragData) {
      throw new Error("Can't drag over editor: No drag in progress");
    }

    // Get rid of everything that could be set
    delete dragData.hoverNode;
    delete dragData.hoverPlaceholder;

    this._currentDrag.next(dragData);
    console.log("Dragged over editor");
  }

  /**
   * @return Observable that always knows all details about the ongoing drag operation.
   */
  get currentDrag(): Observable<CurrentDrag> {
    return (this._currentDrag);
  }

  /**
   * @return Observable to always know the current (very general) state of drag affairs.
   */
  get isDragInProgress() {
    return (this._currentDragInProgress.distinctUntilChanged());
  }

  /**
   * @return Takes a peek whether a drag is occuring *right now*.
   */
  get peekIsDragInProgress(): boolean {
    return (!!this._currentDrag.value);
  }

  /**
   * @return Takes a peek at the data of the drag that is occuring *right now*.
   */
  get peekDragData() {
    return (this._currentDrag.value);
  }
}
