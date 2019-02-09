import { Component, Input, ChangeDetectorRef } from '@angular/core';

import { filter, map, tap, withLatestFrom } from 'rxjs/operators';

import { Node, CodeResource, locationEquals } from '../../../shared/syntaxtree';
import { VisualBlockDescriptions } from '../../../shared/block';
import { arrayEqual } from '../../../shared/util';
import { canEmbraceNode } from '../../../shared/syntaxtree/embrace';

import { DragService } from '../../drag.service';
import { CurrentCodeResourceService } from '../../current-coderesource.service';

import { BlockDropProperties } from './block-drop-properties';
import { calculateDropLocation } from './drop-utils';

/**
 * Renders a single and well known visual element of a node.
 */
@Component({
  templateUrl: 'templates/block-render-block.html',
  selector: `editor-block-render-block`
})
export class BlockRenderBlockComponent implements BlockDropProperties {
  @Input() public codeResource: CodeResource;
  @Input() public node: Node;
  @Input() public visual: VisualBlockDescriptions.EditorBlock;

  constructor(
    private _dragService: DragService,
    private _currentCodeResource: CurrentCodeResourceService,
    private _cd: ChangeDetectorRef
  ) {
  }

  /**
   * Some "fancy" heuristics to determine whether the use wants to embrace
   * something at the current position or do something else.
   *
   * @return The location a drop should occur in.
   */
  get dropLocation() {
    if (this._isEmbraceDrop) {
      return (this.node.location);
    } else {
      return (calculateDropLocation(this.node, this.visual.dropTarget));
    }
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
    const validator = this._currentCodeResource.peekResource.validationLanguagePeek.validator;
    const ownLocation = this.node.location;
    const dropCandidates = this._dragService.peekDragData.draggedDescription;

    return (canEmbraceNode(validator, this.node.tree, ownLocation, dropCandidates));
  }

  /**
   * Notifies the drag service about the drag we have just started.
   */
  onStartDrag(evt: MouseEvent) {
    this._dragService.dragStart(evt, [this.node.toModel()], undefined, {
      node: this.node,
      codeResource: this.codeResource
    });
  }

  onMouseEnter(evt: MouseEvent) {
    if (this._dragService.peekIsDragInProgress) {
      this._dragService.informDraggedOver(evt, this.dropLocation, this.node, this._isEmbraceDrop());
    }
  }

  /**
   * Determines whether a certain codeblock is currently beeing executed.
   * Also triggers change detection
   *
   * TODO: The change detector of the PARENT needs to be triggered because
   *       the animation is checked there!
   */
  readonly isCurrentlyExecuted = this._currentCodeResource.currentExecutionLocation
    .pipe(
      map(loc => locationEquals(loc, this.node.location)),
      tap(_ => {
        this._cd.detectChanges();
      }),
    );
}
