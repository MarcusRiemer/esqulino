import { Component, Input, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { arrayEqual } from '../../../shared/util';
import { Node, NodeLocation, Tree, CodeResource, QualifiedTypeName } from '../../../shared/syntaxtree';
import { BlockLanguage, VisualBlockDescriptions } from '../../../shared/block';

import { DragService } from '../../drag.service';

import { TreeEditorService } from '../../editor.service';

import { calculateDropLocation } from './drop-utils';

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
        backgroundColor: 'lightgray',
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
  @Input() public codeResource: CodeResource;
  @Input() public node: Node;
  @Input() public visual: VisualBlockDescriptions.EditorDropTarget;

  constructor(
    private _dragService: DragService,
    private _treeService: TreeEditorService,
  ) {
  }

  /**
   * @return True, if this drop will be made into a strictly defined category.
   */
  get isParentDrop() {
    const action = this.visual && this.visual.dropTarget && this.visual.dropTarget.parent;
    return (!!action);
  }

  /**
   * @return The name of the referenced child group (if there is any)
   */
  get dropLocationChildGroupName(): string {
    return (this.dropLocation[this.dropLocation.length - 1][0]);
  }

  /**
   * @return true, if the targeted child group has any children.
   */
  get dropLocationHasChildren() {
    const childGroupName = this.dropLocationChildGroupName;
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
    return (calculateDropLocation(this.node, this.visual.dropTarget));
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
            // Would the new tree ba a valid tree?
            const newNode = drag.draggedDescription;
            const oldTree = this._treeService.peekResource.syntaxTreePeek;
            const newTree = oldTree.insertNode(this.dropLocation, newNode);

            const result = this._treeService.peekResource.languagePeek.validateTree(newTree);
            if (result.isValid) {
              return ("available");
            } else {
              return ("none");
            }
          } else if (flags.some(f => f === "ifLegalChild")) {
            // Would the immediate child be allowed?
            const newNodeType: QualifiedTypeName = {
              languageName: drag.draggedDescription.language,
              typeName: drag.draggedDescription.name
            }
            const currentTree = this._treeService.peekResource.syntaxTreePeek;
            const currentLanguage = this._treeService.peekResource.languagePeek;

            const parentNode = currentTree.locate(this.dropLocation.slice(0, -1));
            const parentNodeType = currentLanguage.getType(parentNode.qualifiedName);

            if (parentNodeType.allowsChildType(newNodeType, this.dropLocationChildGroupName)) {
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
        if (flags.some(f => f === "ifEmpty") && !this.dropLocationHasChildren) {
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
    this._treeService.peekResource.insertNode(this.dropLocation, desc);
  }
}
