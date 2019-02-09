import { Component, Input, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { filter, map, tap } from 'rxjs/operators';

import { Node, CodeResource, locationEquals } from '../../../shared/syntaxtree';
import { VisualBlockDescriptions } from '../../../shared/block';

import { CurrentCodeResourceService } from '../../current-coderesource.service';
import { Observable } from 'rxjs';

/**
 * Renders a single and well known visual element of a node.
 */
@Component({
  templateUrl: 'templates/block-render.html',
  selector: `editor-block-render`,
  // TODO: Move animations to host component
  //       https://stackoverflow.com/questions/38975808/adding-an-angular-animation-to-a-host-element
  animations: [
    trigger('isExecuted', [
      state('true', style({ "background": "lime" })),
      transition('false <=> true', animate(200))
    ])
  ]
})
export class BlockRenderComponent {
  @Input() public codeResource: CodeResource;
  @Input() public node: Node;
  @Input() public visual: VisualBlockDescriptions.EditorBlockBase;

  constructor(
    private _currentCodeResource: CurrentCodeResourceService,
    public changeDetector: ChangeDetectorRef
  ) { }

  /**
   * Dirty Hack: Template "Typecast"
   */
  asBlockConstant(block: VisualBlockDescriptions.EditorBlockBase) {
    return (block as VisualBlockDescriptions.EditorConstant);
  }

  /**
   * Dirty Hack: Template "Typecast"
   */
  asBlockInterpolated(block: VisualBlockDescriptions.EditorBlockBase) {
    return (block as VisualBlockDescriptions.EditorInterpolated);
  }

  /**
   * Dirty Hack: Template "Typecast"
   */
  asBlockInput(block: VisualBlockDescriptions.EditorInput) {
    return (block as VisualBlockDescriptions.EditorInput);
  }

  /**
   * @return True, if there should be a break after this element
   */
  get breakAfter() {
    return (this.visual && !!this.visual.breakAfter);
  }

  /**
   * @return The blocks that should be rendered between iterated blocks
   */
  get iteratorSeparatorBlocks() {
    if (VisualBlockDescriptions.isEditorIterator(this.visual)) {
      return (this.visual.between || []);
    } else {
      return ([]);
    }
  }

  /**
   * @return The actual nodes that should be displayed.
   */
  get iteratorChildNodes() {
    if (VisualBlockDescriptions.isEditorIterator(this.visual)) {
      return (this.node.getChildrenInCategory(this.visual.childGroupName));
    } else {
      return ([]);
    }
  }

  /**
   * @return The visual editor block that should be used to represent the given node.
   */
  iteratorGetEditorBlock(node: Node) {
    return (this.codeResource.blockLanguagePeek.getEditorBlock(node.qualifiedName));
  }

  /**
   * A duplicate of the execution detection in the child node, but this one taps
   * this "parents" change detector.
   */
  readonly isCurrentlyExecuted = this._currentCodeResource.currentExecutionLocation
    .pipe(
      map(loc => locationEquals(loc, this.node.location)),
      tap(_ => this.changeDetector.detectChanges()), // TODO: Also called from child
    );

  /**
   * These instructions are used if something is dropped on the block itself.
   */
  readonly defaultBetweenDropTarget: VisualBlockDescriptions.EditorDropTarget = {
    blockType: "dropTarget",
    dropTarget: {
      self: {
        order: "insertAfter",
        skipParents: 0
      }
    },
    direction: "horizontal"
  };
}
