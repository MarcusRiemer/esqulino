import { Injectable, Injector, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Overlay, OverlayRef, GlobalPositionStrategy } from '@angular/cdk/overlay';

import { Observable, BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { AnalyticsService, TrackCategory } from '../shared/analytics.service';
import { Node, NodeDescription, NodeLocation, CodeResource } from '../shared/syntaxtree';
import { FixedSidebarBlock } from '../shared/block';

import { TrashService } from './shared/trash.service';

import { DropBlockComponent } from './drop-block.component';


/**
 * All information about the origin of this drag if it came from
 * the sidebar.
 */
export interface DragSidebar {
  sidebarBlockDescription: FixedSidebarBlock
}

/**
 * All information about the origin of this drag if it came from
 * the tree itself. This is important when moving or replacing
 * nodes in the tree.
 */
export interface DragTree {
  node: Node,
  codeResource: CodeResource
}

/**
 * Groups together everything that might be of interest for a hovering
 * item.
 */
export interface CurrentDrag {
  // The node that is currently hovered over.
  hoverNode?: Node;
  // The placeholder that is currently hovered over
  hoverLocation?: NodeLocation;
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
  private _currentDragInProgress = this._currentDrag.pipe(map(d => !!d));

  private _currentDragOverlay: OverlayRef = undefined;

  private _currentDragPos: GlobalPositionStrategy = undefined;

  private _mouse = {
    x: "0px",
    y: "0px"
  };

  /**
   * This service is involved  with *every* part of the UI and must therefore
   * be attached to the very root of the dependency injection hierarchy. All
   * other services that may exist more then once may not be injected into
   * this service. They need to be passed as "normal" arguments of the existing
   * methods to ensure the correct instances get passed around.
   */
  private constructor(
    private _trashService: TrashService,
    private _analytics: AnalyticsService,
    private _overlay: Overlay,
    private _injector: Injector,
    @Inject(PLATFORM_ID) platformId: string
  ) {
    if (isPlatformBrowser(platformId)) {
      // Most dirty hack: Track the mouse position
      document.addEventListener('mousemove', (evt) => this.updateMousePosition(evt))
      document.addEventListener('mouseenter', (evt) => this.updateMousePosition(evt))
    }
  }

  private updateMousePosition(evt: MouseEvent) {
    this._mouse.x = evt.clientX + "px";
    this._mouse.y = evt.clientY + "px";

    //console.log("global", this._mouse);

    if (typeof (this._currentDragPos) !== "undefined") {
      const floatHeight = 25;
      this._currentDragPos
        .left("" + evt.clientX + "px")
        .top("" + (evt.clientY - floatHeight) + "px");

      this._currentDragPos.apply();
      //console.log("pos", this._mouse);
    }
  }

  private showOverlay(desc: NodeDescription, evt: MouseEvent) {
    // Create a new overlay at an appropriate position
    this._currentDragPos = this._overlay.position().global()
      .left("" + evt.clientX + "px")
      .top("" + evt.clientY + "px");
    this._currentDragOverlay = this._overlay.create({
      positionStrategy: this._currentDragPos,
      hasBackdrop: false
    });

    const portal = DropBlockComponent.createPortalComponent(desc, this._injector);
    this._currentDragOverlay.attach(portal);

    this._currentDragPos.apply();
  }

  private hideOverlay() {
    // Remove a previous overlay (if any)
    if (this._currentDragOverlay) {
      this._currentDragOverlay.dispose();
      this._currentDragOverlay = undefined;
      this._currentDragPos.dispose();
      this._currentDragPos = undefined;
    }
  };

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

    this.showOverlay(desc, evt);

    // We are only interested in the top level drag element, if
    // we wouldn't stop the propagation, the parent of the current
    // drag element would fire another dragstart.
    evt.stopPropagation();
    evt.preventDefault();

    // Serialize the dragged "thing"
    // const domDragData = JSON.stringify(desc);
    // evt.dataTransfer.setData('text/plain', domDragData);

    // TODO: Choose when to move and when to copy
    //evt.dataTransfer.effectAllowed = "move";

    /*const img = document.createElement("img");
    img.src = "/vendor/logos/blattwerkzeug-caption.svg"
    evt.dataTransfer.setDragImage(img, 0, 100);*/
    //evt.dataTransfer.setDragImage(evt.fromElement, 0, 100);

    // Reset everything once the operation has ended
    const dragEndHandler = () => {
      evt.target.removeEventListener("mouseup", dragEndHandler);

      this.hideOverlay();

      this._currentDrag.next(undefined);
      this._trashService.hideTrash();
      console.log(`AST-Drag ended:`, sourceSidebar);

      // Tell the analytics API about the ended event
      this._analytics.trackEvent({
        category: TrackCategory.BlockEditor,
        action: "endDrag",
        name: desc.language,
        value: desc
      });
    }
    document.addEventListener("mouseup", dragEndHandler);

    //evt.target.addEventListener("dragend", dragEndHandler);

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
    if (sourceTree && sourceTree.codeResource) {
      this._trashService.showTrash(_ => {
        sourceTree.codeResource.deleteNode(sourceTree.node.location)
      });
    }
    console.log(`AST-Drag started:`, sourceSidebar);

    // Tell the analytics API about the started event
    this._analytics.trackEvent({
      category: TrackCategory.BlockEditor,
      action: "startDrag",
      name: desc.language,
      value: desc
    });
  }

  /**
   * Needs to be called by nodes when the drag operation currently drags over any placeholder.
   */
  public informDraggedOver(loc: NodeLocation, node: Node) {
    const dragData = this._currentDrag.value;
    if (!dragData) {
      throw new Error("Can't drag over placeholder: No drag in progress");
    }

    // Just in case: Get rid of a possibly set node
    dragData.hoverNode = node;
    dragData.hoverLocation = loc;

    this._currentDrag.next(dragData);

    console.log("Dragging over: ", loc, node);
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
    delete dragData.hoverLocation;

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
    return (this._currentDragInProgress.pipe(distinctUntilChanged()));
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
