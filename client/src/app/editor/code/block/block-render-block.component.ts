import { Component, Input, ChangeDetectorRef } from '@angular/core';

import { filter, map, tap } from 'rxjs/operators';

import { Node, CodeResource, locationEquals } from '../../../shared/syntaxtree';
import { VisualBlockDescriptions } from '../../../shared/block';

import { DragService } from '../../drag.service';
import { CurrentCodeResourceService } from '../../current-coderesource.service';

import { BlockDropProperties } from './block-drop-properties'
import { calculateDropLocation } from './drop-utils';
import { canEmbraceNode } from 'src/app/shared/syntaxtree/embrace';


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
   * @return The location a drop should occur in.
   */
  get dropLocation() {
    const validator = this._currentCodeResource.peekResource.validationLanguagePeek.validator;
    const ownLocation = this.node.location;
    const dropCandidates = this._dragService.peekDragData.draggedDescription;
    if (canEmbraceNode(validator, this.node.tree, ownLocation, dropCandidates)) {
      return (ownLocation);
    } else {
      return (calculateDropLocation(this.node, this.visual.dropTarget));
    }
  }

  onStartDrag(evt: MouseEvent) {
    this._dragService.dragStart(evt, [this.node.toModel()], undefined, {
      node: this.node,
      codeResource: this.codeResource,
    });
  }

  onMouseEnter(evt: MouseEvent) {
    if (this._dragService.peekIsDragInProgress) {
      this._dragService.informDraggedOver(evt, this.dropLocation, this.node);
    }
  }

  readonly isCurrentlyExecuted = this._currentCodeResource.currentExecutionLocation
    .pipe(
      map(loc => locationEquals(loc, this.node.location)),
      tap(_ => {
        this._cd.detectChanges();
      }),
    );
}
