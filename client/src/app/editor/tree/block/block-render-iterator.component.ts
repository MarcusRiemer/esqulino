import { Observable } from 'rxjs';

import { Component, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { Node, NodeLocation, Tree } from '../../../shared/syntaxtree';
import { LanguageModel, EditorBlockDescriptions } from '../../../shared/block';

import { DragService } from '../drag.service';
import { TreeEditorService } from '../editor.service';

// These states are available for animation
type DropTargetAnimationStates = "available" | "none" | "self" | "taken";

/**
 * Renders specific children of a certain child group. Also takes care
 * of reordering or inserting elements.
 */
@Component({
  templateUrl: 'templates/block-render-iterator.html',
  selector: `editor-block-render-iterator`,
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
export class BlockRenderIteratorComponent {
  @Input() public languageModel: LanguageModel;
  @Input() public node: Node;
  @Input() public visual: EditorBlockDescriptions.EditorIterator;

  constructor(
    private _dragService: DragService,
    private _treeService: TreeEditorService,
  ) {
  }
}
