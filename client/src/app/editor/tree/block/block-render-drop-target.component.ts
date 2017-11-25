import { Component, Input, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { arrayEqual } from '../../../shared/util';
import { Node, NodeLocation, Tree } from '../../../shared/syntaxtree';
import { LanguageModel, EditorBlockDescriptions } from '../../../shared/block';

import { DragService } from '../drag.service';
import { TreeEditorService } from '../editor.service';

/**
 * Renders a single and well known visual element of a node.
 */
@Component({
  templateUrl: 'templates/block-render-drop-target.html',
  selector: `editor-block-render-drop-target`,
  animations: [
    trigger('availability', [
      state('none', style({
        display: 'none',
      })),
      state('visible', style({
        backgroundColor: 'lime',
      })),
      state('available', style({
        backgroundColor: 'green',
      })),
      state('self', style({
        backgroundColor: 'yellow',
      })),
    ])
  ]
})
export class BlockRenderDropTargetComponent {
  @Input() public languageModel: LanguageModel;
  @Input() public node: Node;
  @Input() public visual: EditorBlockDescriptions.EditorDropTarget;

  constructor(
    private _dragService: DragService,
    private _treeService: TreeEditorService,
  ) {
  }

  /**
   * @return The name of the referenced child group (if there is any)
   */
  get childGroupName() {
    return (this.visual && this.visual.dropTarget && this.visual.dropTarget.childGroupName);
  }

  /**
   * @return true, if the referenced child group has any children.
   */
  get hasChildren() {
    const childGroupName = this.childGroupName;
    if (this.node && childGroupName) {
      return (this.node.getChildrenInCategory(childGroupName).length > 0);
    } else {
      return (false);
    }
  }

  /**
   * @return The location a drop should occur in if this iterator has no children.
   */
  get emptyDropLocation() {
    const childGroupName = this.childGroupName;
    if (this.node && childGroupName) {
      return (this.node.location.concat([[childGroupName, 0]]));
    }
  }

  /**
   * @return The current animation state
   */
  readonly currentAvailability = this._dragService.currentDrag
    .map(drag => {
      const flags = this.visual.visibility;

      // Ongoing drags trump almost any other possibility
      if (drag) {
        // Highlight in case something is dragging over us. This can only happen if
        // we have been visible before, so there is no need for any additional checking
        const onThis = arrayEqual(drag.hoverPlaceholder, this.emptyDropLocation);
        if (onThis) {
          return ("self");
        } else {
          // Some flags indicate that they want to show this placeholder if a drag is going on
          if (flags.some(f => f === "ifAnyDrag")) {
            return ("available");
          } else if (flags.some(f => f === "ifLegalDrag")) {
            const newNode = drag.draggedDescription;
            const oldTree = this._treeService.peekResource.syntaxTree;
            const newTree = oldTree.insertNode(this.emptyDropLocation, newNode);

            const result = this._treeService.peekLanguage.validateTree(newTree);
            if (result.isValid) {
              return ("available");
            } else {
              return ("none");
            }
          }
        }
      } else {
        // There is no drag, but some placeholders want to be visible anyway
        if (flags.some(f => f === "always")) {
          return ("visible");
        }
        if (flags.some(f => f === "ifEmpty") && !this.hasChildren) {
          return ("visible");
        } else {
          return ("none");
        }
      }
    });

  /**
   * Handles the drop events on the empty drop
   */
  onEmptyDrop(evt: DragEvent) {
    const desc = this._dragService.peekDragData.draggedDescription;
    this._treeService.peekResource.insertNode(this.emptyDropLocation, desc);
  }
}
