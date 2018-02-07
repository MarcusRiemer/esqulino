import { Observable } from 'rxjs';

import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { Node, NodeLocation, Tree, CodeResource } from '../../../shared/syntaxtree';
import { BlockLanguage, VisualBlockDescriptions } from '../../../shared/block';

import { DragService } from '../../drag.service';

import { TreeEditorService } from '../editor.service';

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
   * @return True, if this drop will be made into a strictly defined category.
   *
   * @todo This is redundant, see block-render-drop-target-component.ts
   */
  get isParentDrop() {
    const action = this.visual && this.visual.dropTarget && this.visual.dropTarget.actionParent;
    return (!!action);
  }

  /**
   * @return The name of the referenced child group (if there is any)
   *
   * @todo This is redundant, see block-render-drop-target-component.ts
   */
  get childGroupName() {
    // Is the category specified explicitly?
    const action = this.visual && this.visual.dropTarget && this.visual.dropTarget.actionParent;
    if (action) {
      // Then use that category
      return (action);
    } else {
      // Else use the category of our own node.
      const loc = this.node.location;
      return (loc[loc.length - 1][0]);
    }
  }


  /**
   * @return The location a drop should occur in. This depends on the configuration in the language model.
   *
   * @todo This is redundant, see block-render-drop-target-component.ts
   */
  get dropLocation() {
    if (this.node) {
      if (this.isParentDrop) {
        // If there is an explicit group name, this is always the first node
        return (this.node.location.concat([[this.childGroupName, 0]]));
      } else {
        // Otherwise use (more or less) exact the location we are at. The description
        // may specify some levels that are dropped.
        const lastLevel = this.node.location.length - this.visual.dropTarget.actionSelf.skipParents;
        return (this.node.location.slice(0, lastLevel));
      }
    } else {
      return ([]);
    }
  }

  /**
   * Handles the drop events on the empty drop
   */
  onDrop(evt: DragEvent) {
    const desc = this._dragService.peekDragData.draggedDescription;
    this._treeService.peekResource.insertNode(this.dropLocation, desc);
  }
}
