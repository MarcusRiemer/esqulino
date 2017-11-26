import { Component, Input, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { arrayEqual } from '../../../shared/util';
import { Node, NodeLocation, Tree } from '../../../shared/syntaxtree';
import { LanguageModel, EditorBlockDescriptions } from '../../../shared/block';

import { DragService } from '../../drag.service';

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
   * @return True, if this drop will be made into a strictly defined category.
   */
  get isParentDrop() {
    const action = this.visual && this.visual.dropTarget && this.visual.dropTarget.actionParent;
    return (!!action);
  }

  /**
   * @return The name of the referenced child group (if there is any)
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
   * @return true, if the targeted child group has any children.
   */
  get hasChildren() {
    const childGroupName = this.childGroupName;
    if (this.isParentDrop) {
      // Count children in that category
      return (this.node.getChildrenInCategory(childGroupName).length > 0);
    } else {
      // At least the given node is in the category
      return (true);
    }
  }

  /**
   * @return The location a drop should occur in. This depends on the configuration in the language model.
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
   * @return The current animation state
   */
  readonly currentAvailability = this._dragService.currentDrag
    .map(drag => {
      const flags = this.visual.visibility;

      // Ongoing drags trump almost any other possibility
      if (drag) {
        // Highlight in case something is dragging over us. This can only happen if
        // we have been visible before, so there is no need for any additional checking
        const onThis = arrayEqual(drag.hoverPlaceholder, this.dropLocation);
        if (onThis) {
          return ("self");
        } else {
          // Some flags indicate that they want to show this placeholder if a drag is going on
          if (flags.some(f => f === "ifAnyDrag")) {
            return ("available");
          } else if (flags.some(f => f === "ifLegalDrag")) {
            const newNode = drag.draggedDescription;
            const oldTree = this._treeService.peekResource.syntaxTreePeek;
            const newTree = oldTree.insertNode(this.dropLocation, newNode);

            const result = this._treeService.peekResource.languagePeek.validateTree(newTree);
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
  onDrop(evt: DragEvent) {
    const desc = this._dragService.peekDragData.draggedDescription;
    console.log(this.node, this.dropLocation);
    this._treeService.peekResource.insertNode(this.dropLocation, desc);
  }
}
