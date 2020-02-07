import { Injectable, Injector, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Overlay, OverlayRef, GlobalPositionStrategy } from '@angular/cdk/overlay';

import { Observable, BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { AnalyticsService, TrackCategory } from '../shared/analytics.service';
import { Node, NodeDescription, NodeLocation, CodeResource } from '../shared/syntaxtree';
import { FixedSidebarBlock } from '../shared/block';

import { TrashService } from './shared/trash.service';

import { DraggedBlockComponent } from './dragged-block.component';
import { CurrentCodeResourceService } from './current-coderesource.service';
import { SmartDropOptions, SmartDropLocation } from '../shared/syntaxtree/drop.description';
import { smartDropLocation } from '../shared/syntaxtree/drop';


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
  codeResource: CodeResource,
}

/**
 * Groups together everything that might be of interest for a hovering
 * item.
 */
export interface CurrentDrag {
  // The node that is currently hovered over.
  hoverNode?: Node;
  // Is the node currently hovering over something for deletion?
  hoverTrash: boolean;
  // The location that would be dropped at
  dropLocation?: NodeLocation;
  // True, if the current drop would result in an embrace
  isEmbraceDrop: boolean;
  // The JSON representation of the thing that is currently beeing dragged
  draggedDescription: NodeDescription[];
  // The node in the tree that is currently beeing dragged
  treeSource?: DragTree;
  // The node of the sidebar that is currently beeing dragged
  sidebarSource?: DragSidebar;
  // All possibilities to drop something
  smartDrops: SmartDropLocation[];
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

  // The drag position as maintained by Angular
  private _currentDragPos: GlobalPositionStrategy = undefined;

  // The most recent mouse position
  private _mouse = {
    x: "0px",
    y: "0px"
  };

  // Indicates whether the current `mouseEnter` event could have been caused
  // by a mouse movement. This is an attempt to prevent unstable UI state in which
  // the animation of a drop target causes the drop location to shift.
  private _mouseMoveCausedDragOver = false;

  // If a drag has been ignored because the mouse did not move in between, the next
  // mouse move might need to re-trigger that event. Otherwise the subsequent move
  // might visually occur over an element that would change the drop location, but
  // no visual feedback is provided because the `mouseenter`-event did not fire.
  private _bufferedDragOver?: {
    dropLocation: NodeLocation,
    node: Node | undefined,
    smartDropOptions: SmartDropOptions
  } = undefined;

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
    private _currentCodeResource: CurrentCodeResourceService,
    @Inject(PLATFORM_ID) platformId: string
  ) {
    if (isPlatformBrowser(platformId)) {
      // Most dirty hack: Track the mouse position to emulate our own drag & drop
      document.addEventListener('mousemove', (evt) => this.updateMousePosition(evt))
      document.addEventListener('mouseenter', (evt) => this.updateMousePosition(evt))
    }
  }

  /**
   * This callback is fired whenever the mouse is moved. It moves the overlayed
   * dragged block to the cursor.
   */
  private updateMousePosition(evt: MouseEvent) {
    this._mouse.x = evt.clientX + "px";
    this._mouse.y = evt.clientY + "px";

    if (typeof (this._currentDragPos) !== "undefined") {
      const floatHeight = 10; // Show the dragged element below the cursor
      this._currentDragPos
        .left("" + evt.clientX + "px")
        .top("" + (evt.clientY + floatHeight) + "px");

      this._currentDragPos.apply();
    }

    // The mouse was moved, this may cause a new drop location
    if (this._bufferedDragOver && this.peekIsDragInProgress) {
      this.informDraggedOverImpl(
        this._bufferedDragOver.dropLocation,
        this._bufferedDragOver.node,
        this._bufferedDragOver.smartDropOptions
      );
    } else {
      // Not yet, but the next movement may
      this._mouseMoveCausedDragOver = true;
    }
  }

  /**
   * Creates an overlay for the dragged description.
   */
  private showDraggedBlock(desc: NodeDescription, evt: MouseEvent) {
    // Create a new overlay at an appropriate position
    this._currentDragPos = this._overlay.position().global()
      .left("" + evt.clientX + "px")
      .top("" + evt.clientY + "px");
    this._currentDragOverlay = this._overlay.create({
      positionStrategy: this._currentDragPos,
      hasBackdrop: false
    });

    const portal = DraggedBlockComponent.createPortalComponent(desc, this._injector);
    this._currentDragOverlay.attach(portal);

    this._currentDragPos.apply();
  }

  private hideDraggedBlock() {
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
   * @param desc The description of the node to be dragged around
   * @param sourceSidebar The serializable drag information
   * @param sourceTree The node with the corresponding tree that started the drag
   */
  public dragStart(
    evt: MouseEvent,
    desc: NodeDescription[],
    sourceSidebar?: DragSidebar,
    sourceTree?: DragTree
  ) {
    if (this._currentDrag.value) {
      throw new Error("Attempted to start a second drag");
    }

    // We are only interested in the top level drag element, if
    // we wouldn't stop the propagation, the parent of the current
    // drag element would fire another dragstart.
    evt.stopPropagation();
    evt.preventDefault();

    // Store drag information as long as this drags on
    // (And initialize some default values)
    const hoverData: CurrentDrag = {
      draggedDescription: desc,
      smartDrops: [],
      hoverTrash: false,
      isEmbraceDrop: false
    };

    // Attach source information (if any)
    if (sourceSidebar) {
      hoverData.sidebarSource = sourceSidebar;
    }
    if (sourceTree) {
      hoverData.treeSource = sourceTree;
    }

    // And fire the drag out
    this._currentDrag.next(hoverData);

    // If we have a proper source: Wire it up to react to
    // being put in the trash.
    if (sourceTree && sourceTree.codeResource) {
      this._trashService.showTrash(() => {
        sourceTree.codeResource.deleteNode(sourceTree.node.location)
      });
    }

    // Actually show the overlay and make sure it is removed afterwards
    this.setupDragEndHandlers(desc);
    this.showDraggedBlock(desc[0], evt);

    console.log(`AST-Drag started:`, sourceSidebar);

    // Tell the analytics API about the started event
    this._analytics.trackEvent({
      category: TrackCategory.BlockEditor,
      action: "startDrag",
      name: desc[0].language,
      value: desc
    });
  }

  /**
   * Needs to be called by nodes when the drag operation currently drags over any placeholder.
   */
  public informDraggedOver(
    evt: MouseEvent,
    dropLocation: NodeLocation,
    node: Node | undefined,
    smartDropOptions: SmartDropOptions
  ) {
    // Ensure that no other block tells the same story
    evt.stopImmediatePropagation();

    // Was this caused by a direct user interaction?
    if (this._mouseMoveCausedDragOver) {
      this.informDraggedOverImpl(dropLocation, node, smartDropOptions);
    } else {
      // Keep the event in mind for later
      this._bufferedDragOver = {
        dropLocation: dropLocation,
        node: node,
        smartDropOptions: smartDropOptions
      };
    }
  }

  /**
   * The actual implementation of drag notifications.
   */
  private informDraggedOverImpl(
    dropLocation: NodeLocation,
    node: Node | undefined,
    smartDropOptions: SmartDropOptions
  ) {
    const dragData = this._currentDrag.value;
    if (!dragData) {
      throw new Error("Can't drag over anything: No drag in progress");
    }

    // If another change comes (without the mouse beeing moved) we
    // are not interested.
    this._mouseMoveCausedDragOver = false;
    this._bufferedDragOver = undefined;

    const currentCodeResource = this._currentCodeResource.peekResource;

    // Find out which locations are currently candidates for drags
    const smartDropLocations = smartDropLocation(
      smartDropOptions,
      currentCodeResource.validatorPeek,
      currentCodeResource.syntaxTreePeek,
      dropLocation,
      dragData.draggedDescription
    );

    // Just in case: Reset all the data
    dragData.hoverNode = node;
    dragData.hoverTrash = false;
    dragData.smartDrops = smartDropLocations;

    // Temporarily: Smash down all the smart drop locations to a single option
    dragData.dropLocation = smartDropLocations.length > 0 ? smartDropLocations[0].location : undefined;
    dragData.isEmbraceDrop = smartDropLocations.length > 0 && smartDropLocations[0].operation === "embrace";

    // console.log(`Dragging over ${JSON.stringify(dropLocation)}`, smartDropLocations);
    this._currentDrag.next(dragData);
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
    delete dragData.dropLocation;
    dragData.hoverTrash = false;
    dragData.isEmbraceDrop = false;
    dragData.smartDrops = [];

    this._bufferedDragOver = undefined;

    this._currentDrag.next(dragData);
  }

  /**
   * Needs to be called when the drag operation currently drags over the editor.
   */
  public informDraggedOverTrash() {
    const dragData = this._currentDrag.value;

    // Get rid of everything that could be set ...
    delete dragData.hoverNode;
    delete dragData.dropLocation;
    dragData.isEmbraceDrop = false;
    dragData.smartDrops = [];

    // .. but the trash
    dragData.hoverTrash = true;

    this._bufferedDragOver = undefined;

    this._currentDrag.next(dragData);
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

  /**
   * Sets up and tears down the DOM event handlers that deal with our
   * hand rolled drag & drop implementation.
   */
  private setupDragEndHandlers(desc: NodeDescription[]) {
    // Reset everything once the operation has ended
    const dragEndHandler = (cancelled: boolean) => {
      // Keep a reference to the now finished drag
      const dragData = this._currentDrag.value;

      // Do the strictly required internal bookkeeping
      removeDragHandlers();
      this.hideDraggedBlock();
      this._currentDrag.next(undefined);

      // Tell the analytics API about the ended event
      this._analytics.trackEvent({
        category: TrackCategory.BlockEditor,
        action: "endDrag",
        name: desc[0].language,
        value: desc
      });

      // Should something be inserted or removed?
      // - Not if the operation has been canceled
      if (!cancelled) {
        // Insertion happens on valid drop locations
        if (dragData.smartDrops.length > 0) {
          const drop = dragData.smartDrops[0];
          switch (drop.operation) {
            case "embrace":
              this._currentCodeResource.peekResource.embraceNode(drop.location, [drop.nodeDescription]);
              break;
            case "insert":
              this._currentCodeResource.peekResource.insertNode(drop.location, drop.nodeDescription);
              break;
            case "replace":
              this._currentCodeResource.peekResource.replaceNode(drop.location, drop.nodeDescription);
              break;
            default:
              throw new Error(`Unhandled smart drop: ${JSON.stringify(drop)}`);
          }
        }
        // Otherwise we might want to remove the current node?
        if (dragData.hoverTrash) {
          this._trashService._fireDrop();
          console.log("Dropped on trash");
        }
      }

      this._trashService.hideTrash();
      console.log(`AST-Drag ended: `, dragData);
    }

    // Dragging ends when the mouse is no longer pressed ...
    const mouseUpHandler = (evt: MouseEvent) => {
      evt.stopImmediatePropagation();
      dragEndHandler(false);
    };
    document.addEventListener("mouseup", mouseUpHandler);

    // ... or the user presses "Escape"
    const escHandler = (evt: KeyboardEvent) => {
      if (evt.key === "Escape") {
        dragEndHandler(true);
      }
    };
    document.addEventListener("keyup", escHandler);

    const removeDragHandlers = () => {
      document.removeEventListener("mouseup", mouseUpHandler);
      document.removeEventListener("keydown", escHandler);
    }
  }
}
