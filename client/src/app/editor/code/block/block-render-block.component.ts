import {
  Component,
  Input,
  ChangeDetectorRef,
  HostListener,
  HostBinding,
  Optional,
  ChangeDetectionStrategy,
} from "@angular/core";

import { combineLatest, concat, Observable, of } from "rxjs";
import {
  map,
  withLatestFrom,
  distinctUntilChanged,
  tap,
  filter,
} from "rxjs/operators";

import {
  SyntaxNode,
  locationEquals,
  locationMatchingLength,
  isChildLocation,
  locationSibling,
  _exactMatches,
  locationSiblingOrder,
} from "../../../shared/syntaxtree";
import { VisualBlockDescriptions } from "../../../shared/block";
import { arrayEqual } from "../../../shared/util";
import { canEmbraceNode } from "../../../shared/syntaxtree/drop-embrace";
import {
  nodeIsInSingularHole,
  relativeDropLocation,
} from "../../../shared/syntaxtree/drop-util";
import { RelativeDropLocation } from "../../../shared/syntaxtree/drop.description";

import { DragService } from "../../drag.service";
import { CurrentCodeResourceService } from "../../current-coderesource.service";

import { RenderedCodeResourceService } from "./rendered-coderesource.service";
import { BlockRenderContainerComponent } from "./block-render-container.component";

export type BackgroundState = "executed" | "replaced" | "neutral" | "consumed";

/**
 * Renders a single and well known visual element of a node.
 */
@Component({
  templateUrl: "templates/block-render-block.html",
  selector: `editor-block-render-block`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockRenderBlockComponent {
  /**
   * The node to be rendered
   */
  @Input()
  public node: SyntaxNode;

  /**
   * The visualisation parameters for this block.
   */
  @Input()
  public visual: VisualBlockDescriptions.EditorBlock;

  @HostBinding("class.vertical")
  public get hostCssVertical() {
    if (this._parentContainer) {
      return this._parentContainer.orientation === "vertical";
    } else {
      return true;
    }
  }

  @HostBinding("class.horizontal")
  public get hostCssHorizontal() {
    if (this._parentContainer) {
      return this._parentContainer.orientation === "horizontal";
    } else {
      return false;
    }
  }

  constructor(
    private _dragService: DragService,
    private _currentCodeResource: CurrentCodeResourceService,
    private _renderData: RenderedCodeResourceService,
    private _changeDetector: ChangeDetectorRef,
    @Optional()
    private _parentContainer: BlockRenderContainerComponent
  ) {}

  /**
   * @return True, if embracing should be enabled for things dropped on this block
   */
  get allowEmbrace() {
    // This is currently a hack: We control embracing globally based on an URL parameter
    if (window && window.location) {
      const url = new URL(window.location.href);
      return url.searchParams.has("allowEmbrace");
    } else {
      return false;
    }
  }

  /**
   * @return The location a drop should occur in.
   */
  get dropLocation() {
    return this.node.location;
  }

  private readonly _latestDragData = this._dragService.currentDrag.pipe(
    withLatestFrom(this._dragService.isDragInProgress)
  );

  readonly isEmbraceDrop = this._latestDragData.pipe(
    map(
      ([currentDrag, inProgress]) =>
        inProgress &&
        arrayEqual(this.node.location, currentDrag.dropLocation) &&
        this._isEmbraceDrop()
    )
  );

  /**
   * @return True, if the current drop operation would result in an embrace.
   */
  private _isEmbraceDrop() {
    const validator = this._renderData.validator;
    const ownLocation = this.node.location;
    const dropCandidates = this._dragService.peekDragData.draggedDescription;

    return canEmbraceNode(
      validator,
      this.node.tree,
      ownLocation,
      dropCandidates
    );
  }

  /**
   * Notifies the drag service about the drag we have just started.
   */
  @HostListener("dragstart", ["$event"])
  onStartDrag(evt: MouseEvent) {
    if (!this._renderData.readOnly) {
      this._dragService.dragStart(evt, [this.node.toModel()], undefined, {
        node: this.node,
        codeResource: this._renderData.codeResource,
      });
    }
  }

  /**
   * A mouse has entered the block and might want to drop something.
   */
  @HostListener("mouseover", ["$event", `'block'`])
  onMouseOver(evt: MouseEvent, dropLocationHint: RelativeDropLocation) {
    // If we may react to a drag operation: Advertise us as a target
    if (!this._renderData.readOnly && this._dragService.peekIsDragInProgress) {
      const shiftedLocation = relativeDropLocation(
        this.node.location,
        dropLocationHint
      );
      const explicitAfterOrBefore = dropLocationHint !== "block";

      // TODO: Find a meaningful approach if a drop is possible in the child AND after the
      //       hovered element. With the commented out state this favors appending
      this._dragService.informDraggedOver(evt, shiftedLocation, this.node, {
        // Disabled because allowAnyParent inserts in front so defaulting to append seems smarter
        allowExact: false,
        allowAnyParent: true,
        allowEmbrace: this.allowEmbrace && !explicitAfterOrBefore,
        allowAppend: true,
        allowReplace: !explicitAfterOrBefore,
      });
    }
  }

  /**
   * Determines whether a certain codeblock is currently beeing executed.
   */
  readonly isOnExecutionPath =
    this._currentCodeResource.currentExecutionLocation$.pipe(
      map((loc) => {
        const matchingLength = locationMatchingLength(this.node.location, loc);
        return (
          matchingLength !== false &&
          matchingLength > 0 &&
          matchingLength - 1 < loc.length
        );
      }),
      distinctUntilChanged(),
      tap((_) => this._changeDetector.markForCheck())
    );

  /**
   * Determines whether a certain codeblock is currently beeing executed.
   */
  readonly isCurrentlyExecuted$ = concat(
    of(false),
    this._currentCodeResource.currentExecutionLocation$.pipe(
      // Even if the node is properly initialized, the input property may be missing
      // because it is initialized later
      filter((_) => !!this.node),
      map((loc) => locationEquals(loc, this.node.location)),
      distinctUntilChanged(),
      tap((_) => this._changeDetector.markForCheck())
    )
  );

  /**
   * True, if this block is currently being replaced.
   */
  readonly isBeingReplaced = this._latestDragData.pipe(
    map(([currentDrag, inProgress]) => {
      if (inProgress && currentDrag.smartDrops.length > 0) {
        const smartDrop = currentDrag.smartDrops[0];

        return (
          smartDrop.operation === "replace" &&
          locationEquals(this.node.location, smartDrop.location)
        );
      } else {
        return false;
      }
    })
  );

  /**
   * A non empty string if it is sensible to show more detailed drop location hints.
   * This is the case if the location that would be dropped in to is at
   * least not empty and if it would take the type.
   */
  readonly showRelativeDropLocations$: Observable<
    false | "begin" | "end" | "both"
  > = combineLatest([
    this._dragService.isDragInProgress,
    this._dragService.currentDrag,
    this._renderData.validator$,
  ]).pipe(
    map(([inProgress, currentDrag, validator]) => {
      if (inProgress && !this._renderData.readOnly && currentDrag) {
        const ownLocation = this.node.location;
        const firstSmartDropLocation = currentDrag.smartDrops[0]?.location;
        /*const prevSiblingLoc = locationSibling(ownLocation, -1);
        //const succSiblingLoc = locationSibling(ownLocation, -1);
        const succSiblingLoc = ownLocation;
        //const succSiblingLoc = locationSibling(ownLocation, 1);*/

        const prevSiblingLoc = ownLocation;
        const succSiblingLoc = locationSibling(ownLocation, 1);

        // First check: The current drop location might have nothing to do
        // with this node, but it still possibly needs to highlight a drop
        // that is made somewhere else.

        const prevExactMatch = locationEquals(
          prevSiblingLoc,
          firstSmartDropLocation
        );
        const succExactMatch = locationEquals(
          succSiblingLoc,
          firstSmartDropLocation
        );

        if (prevExactMatch) {
          return locationSiblingOrder(ownLocation, prevSiblingLoc);
        } else if (succExactMatch) {
          return locationSiblingOrder(ownLocation, succSiblingLoc);
        }

        // If we are still here: There is no current dragging going on
        // that targets any sibling, but this new drag could be it.
        const hoveringHere = currentDrag.hoverNode === this.node;

        const prevAllowed =
          hoveringHere &&
          currentDrag.hoverPortion === "begin" &&
          _exactMatches(
            validator,
            this.node.tree,
            prevSiblingLoc,
            currentDrag.draggedDescription
          ).length > 0;

        const succAllowed =
          hoveringHere &&
          currentDrag.hoverPortion === "end" &&
          _exactMatches(
            validator,
            this.node.tree,
            succSiblingLoc,
            currentDrag.draggedDescription
          ).length > 0;

        if (nodeIsInSingularHole(validator, this.node)) {
          return false;
        } else if (prevAllowed && succAllowed) {
          return "both";
        } else if (!prevAllowed && succAllowed) {
          return "end";
        } else if (prevAllowed && !succAllowed) {
          return "begin";
        } else {
          return false;
        }
      } else {
        return false;
      }
    })
  );

  /**
   * Reacts to the current drag event being something that would be "consumed"
   * by this node.
   */
  readonly isConsumingDrag$: Observable<boolean> = this._latestDragData.pipe(
    map(([currentDrag, inProgress]) => {
      if (inProgress && currentDrag.smartDrops.length > 0) {
        const smartDrop = currentDrag.smartDrops[0];
        const ownLocation = this.node.location;
        currentDrag.dropLocation;

        return (
          smartDrop.operation === "insert" &&
          // If we only checked for the child location, the consuming drag would walk
          // up the whole tree instead of highlighting exactly this node
          isChildLocation(currentDrag.dropLocation, ownLocation, 1) &&
          isChildLocation(smartDrop.location, ownLocation, 1)
        );
      } else {
        return false;
      }
    })
  );

  /**
   * All different background states.
   */
  readonly backgroundState$: Observable<BackgroundState> = concat(
    of("neutral" as const),
    combineLatest([
      this.isBeingReplaced,
      this.isCurrentlyExecuted$,
      this.isConsumingDrag$,
    ]).pipe(
      map(
        ([
          isBeingReplaced,
          isCurrentlyExecuted,
          isConsuming,
        ]): BackgroundState => {
          if (isBeingReplaced && !this._renderData.readOnly) {
            return "replaced" as const;
          } else if (isCurrentlyExecuted) {
            return "executed" as const;
          } else if (isConsuming && !this._renderData.readOnly) {
            return "consumed" as const;
          } else {
            return "neutral" as const;
          }
        }
      )
    )
  ).pipe();
}
