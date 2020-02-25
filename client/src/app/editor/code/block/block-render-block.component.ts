import { Component, Input, ChangeDetectorRef, HostListener } from '@angular/core';

import { combineLatest, Observable } from 'rxjs';
import { map, withLatestFrom, distinctUntilChanged, tap, filter } from 'rxjs/operators';

import { Node, locationEquals, locationMatchingLength } from '../../../shared/syntaxtree';
import { VisualBlockDescriptions } from '../../../shared/block';
import { arrayEqual } from '../../../shared/util';
import { canEmbraceNode } from '../../../shared/syntaxtree/drop-embrace';
import { nodeIsInSingularHole, relativeDropLocation, RelativeDropLocation } from '../../../shared/syntaxtree/drop-util';

import { DragService } from '../../drag.service';
import { CurrentCodeResourceService } from '../../current-coderesource.service';

import { RenderedCodeResourceService } from './rendered-coderesource.service';

export type BackgroundState = "executed" | "replaced" | "neutral";

/**
 * Renders a single and well known visual element of a node.
 */
@Component({
  templateUrl: 'templates/block-render-block.html',
  selector: `editor-block-render-block`
})
export class BlockRenderBlockComponent {
  /**
   * The node to be rendered
   */
  @Input() public node: Node;

  /**
   * The visualisation parameters for this block.
   */
  @Input() public visual: VisualBlockDescriptions.EditorBlock;

  constructor(
    private _dragService: DragService,
    private _currentCodeResource: CurrentCodeResourceService,
    private _renderData: RenderedCodeResourceService,
    private _changeDetector: ChangeDetectorRef
  ) {
  }

  /**
   * @return True, if embracing should be enabled for things dropped on this block
   */
  get allowEmbrace() {
    // This is currently a hack: We control embracing globally based on an URL parameter
    if (window && window.location) {
      const url = new URL(window.location.href);
      return (url.searchParams.has("allowEmbrace"));
    } else {
      return (false);
    }
  }

  /**
   * @return The location a drop should occur in.
   */
  get dropLocation() {
    return (this.node.location);
  }

  private readonly _latestDragData = this._dragService.currentDrag.pipe(
    withLatestFrom(this._dragService.isDragInProgress),
  );

  readonly isEmbraceDrop = this._latestDragData.pipe(
    map(([currentDrag, inProgress]) =>
      inProgress && arrayEqual(this.node.location, currentDrag.dropLocation) && this._isEmbraceDrop()
    )
  );

  /**
   * @return True, if the current drop operation would result in an embrace.
   */
  private _isEmbraceDrop() {
    const validator = this._renderData.validator;
    const ownLocation = this.node.location;
    const dropCandidates = this._dragService.peekDragData.draggedDescription;

    return (canEmbraceNode(validator, this.node.tree, ownLocation, dropCandidates));
  }

  /**
   * Notifies the drag service about the drag we have just started.
   */
  @HostListener('dragstart', ['$event'])
  onStartDrag(evt: MouseEvent) {
    if (!this._renderData.readOnly) {
      this._dragService.dragStart(evt, [this.node.toModel()], undefined, {
        node: this.node,
        codeResource: this._renderData.codeResource
      });
    }
  }

  /**
   * A mouse has entered the block and might want to drop something.
   */
  @HostListener('mouseover', ['$event', `'block'`])
  onMouseOver(evt: MouseEvent, dropLocationHint: RelativeDropLocation) {
    // If we may react to a drag operation: Advertise us as a target
    if (!this._renderData.readOnly && this._dragService.peekIsDragInProgress) {
      const shiftedLocation = relativeDropLocation(this.node.location, dropLocationHint);
      const explicitLocation = dropLocationHint !== "block";

      this._dragService.informDraggedOver(evt, shiftedLocation, this.node, {
        // Disabled because allowAnyParent inserts in front so defaulting to append seems smarter
        allowExact: false,
        allowAnyParent: true,
        allowEmbrace: this.allowEmbrace && !explicitLocation,
        allowAppend: true,
        allowReplace: explicitLocation
      });
    }
  }

  /**
   * Determines whether a certain codeblock is currently beeing executed.
   */
  readonly isOnExecutionPath = this._currentCodeResource.currentExecutionLocation
    .pipe(
      map(loc => {
        const matchingLength = locationMatchingLength(this.node.location, loc);
        return (matchingLength !== false && matchingLength > 0 && matchingLength - 1 < loc.length);
      }),
      distinctUntilChanged(),
      tap(_ => this._changeDetector.markForCheck())
    );

  /**
   * Determines whether a certain codeblock is currently beeing executed.
   */
  readonly isCurrentlyExecuted$ = this._currentCodeResource.currentExecutionLocation
    .pipe(
      // Even if the node is properly initialized, the input property may be missing
      // because it is initialized later
      filter(_ => !!this.node),
      map(loc => locationEquals(loc, this.node.location)),
      distinctUntilChanged(),
      tap(_ => this._changeDetector.markForCheck())
    );

  /**
   * True, if this block is currently being replaced.
   */
  readonly isBeingReplaced = this._latestDragData.pipe(
    map(([currentDrag, inProgress]) => {
      if (inProgress && currentDrag.smartDrops.length > 0) {
        const smartDrop = currentDrag.smartDrops[0];

        return (
          smartDrop.operation === "replace"
          && locationEquals(this.node.location, smartDrop.location)
        );
      } else {
        return (false);
      }
    })
  );

  /**
   * True if it is sensible to show more detailed drop location hints.
   * This is the case if the location that would be dropped in to is at
   * least not empty and if it would take the type.
   */
  readonly showRelativeDropLocations: Observable<Boolean> = combineLatest(
    this._dragService.isDragInProgress,
    this._dragService.currentDrag
  ).pipe(
    map(([inProgress, currentDrag]) => {
      if (inProgress && !this._renderData.readOnly && currentDrag) {
        return (currentDrag.hoverNode === this.node && !nodeIsInSingularHole(
          this._renderData.codeResource.validatorPeek,
          this.node
        ));
      } else {
        return (false);
      }
    })
  );

  /**
   * All different background states.
   */
  readonly backgroundState: Observable<BackgroundState> = combineLatest(
    this.isBeingReplaced,
    this.isCurrentlyExecuted$
  ).pipe(
    map(([isBeingReplaced, isCurrentlyExecuted]): BackgroundState => {
      if (isBeingReplaced && !this._renderData.readOnly) {
        return ("replaced");
      } else if (isCurrentlyExecuted) {
        return ("executed");
      } else {
        return ("neutral");
      }
    })
  );
}
