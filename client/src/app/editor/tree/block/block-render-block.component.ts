import { Observable } from 'rxjs';

import { Component, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { Node, NodeLocation, Tree, CodeResource } from '../../../shared/syntaxtree';
import { LanguageModel, EditorBlockDescriptions } from '../../../shared/block';

import { DragService } from '../../drag.service';

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
export class BlockRenderBlockComponent {
  @Input() public codeResource: CodeResource;
  @Input() public node: Node;
  @Input() public visual: EditorBlockDescriptions.EditorBlock;

  // The current state that should be used for the animation
  private _cached_dropTargetAnimationState: Observable<DropTargetAnimationStates>;

  constructor(
    private _dragService: DragService,
  ) {
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
}
