import { Component, Input, OnInit } from '@angular/core';

import { Node, NodeLocation, Tree, CodeResource } from '../../../shared/syntaxtree';
import { LanguageModel, VisualBlockDescriptions } from '../../../shared/block';

/**
 * Renders a single and well known visual element of a node.
 */
@Component({
  templateUrl: 'templates/block-render.html',
  selector: `editor-block-render`
})
export class BlockRenderComponent implements OnInit {
  @Input() public codeResource: CodeResource;
  @Input() public node: Node;
  @Input() public visual: VisualBlockDescriptions.EditorBlockBase;

  ngOnInit() {

  }
}
