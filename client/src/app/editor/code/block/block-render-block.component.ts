import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Node, NodeLocation, Tree, CodeResource } from '../../../shared/syntaxtree';
import { BlockLanguage, VisualBlockDescriptions } from '../../../shared/block';

import { DragService } from '../../drag.service';

import { CurrentCodeResourceService } from '../../current-coderesource.service';

import { calculateDropLocation, calculateDropTargetState, DropTargetState } from './drop-utils';

/**
 * Renders a single and well known visual element of a node.
 */
@Component({
  templateUrl: 'templates/block-render-block.html',
  selector: `editor-block-render-block`,
  animations: [
    trigger('dropTarget', [
      state('none', style({
      })),
      state('available', style({
      })),
      state('self', style({
      })),
    ])
  ]
})
export class BlockRenderBlockComponent implements OnInit {
  @Input() public codeResource: CodeResource;
  @Input() public node: Node;
  @Input() public visual: VisualBlockDescriptions.EditorBlock;

  constructor(
    private _dragService: DragService,
    private _currentCodeResource: CurrentCodeResourceService,
  ) {
  }

  ngOnInit() {

  }

  readonly dropTargetAnimationState: Observable<DropTargetState> = this._dragService.currentDrag
    .pipe(map(drag => calculateDropTargetState(drag, this)));

  /**
   * @return The location a drop should occur in.
   */
  get dropLocation() {
    return (calculateDropLocation(this.node, this.visual.dropTarget));
  }

  /**
   * Handles the drop events on the empty drop
   */
  onDrop(evt: DragEvent) {
    const desc = this._dragService.peekDragData.draggedDescription;
    this._currentCodeResource.peekResource.insertNode(this.dropLocation, desc);
  }
}
