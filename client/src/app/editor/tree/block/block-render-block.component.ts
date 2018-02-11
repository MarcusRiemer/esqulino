import { Observable } from 'rxjs';

import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { Node, NodeLocation, Tree, CodeResource } from '../../../shared/syntaxtree';
import { BlockLanguage, VisualBlockDescriptions } from '../../../shared/block';

import { DragService } from '../../drag.service';

import { TreeEditorService } from '../editor.service';

import { calculateDropLocation } from './drop-utils';

// These states are available for animation
type DropTargetAnimationStates = "available" | "none" | "self" | "taken";

/**
 * Renders a single and well known visual element of a node.
 */
@Component({
  templateUrl: 'templates/block-render-block.html',
  selector: `editor-block-render-block`,
  animations: [
    trigger('dropTarget', [
      state('none', style({
        backgroundColor: 'white',
      })),
      state('available', style({
        backgroundColor: 'lime',
      })),
      state('self', style({
        backgroundColor: 'yellow',
      })),
    ])
  ]
})
export class BlockRenderBlockComponent implements OnInit {
  @Input() public codeResource: CodeResource;
  @Input() public node: Node;
  @Input() public visual: VisualBlockDescriptions.EditorBlock;

  // The current state that should be used for the animation
  private _cached_dropTargetAnimationState: Observable<DropTargetAnimationStates>;


  constructor(
    private _dragService: DragService,
    private _treeService: TreeEditorService,
  ) {
  }

  ngOnInit() {

  }

  get dropTargetAnimationState(): Observable<DropTargetAnimationStates> {
    if (!this._cached_dropTargetAnimationState) {
      this._cached_dropTargetAnimationState = this._dragService.currentDrag
        .map(drag => {
          if (!drag) {
            // There is no drag operation
            return ("none");
          }
          else if (drag.hoverNode && drag.hoverNode == this.node) {
            // There is a drag operation and it targets us
            return ("self");
          } else {
            // There is a drag operation and it targets something else
            return ("available");
          }
        })
        .distinctUntilChanged()
    }

    return (this._cached_dropTargetAnimationState);
  }



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
    this._treeService.peekResource.insertNode(this.dropLocation, desc);
  }
}
