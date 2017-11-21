import { Component, Input, OnInit } from '@angular/core';

import { Node, NodeLocation, Tree } from '../../../shared/syntaxtree';
import { LanguageModel, EditorBlockDescriptions } from '../../../shared/block';

/**
 * Renders a single and well known visual element of a node.
 */
@Component({
  templateUrl: 'templates/block.html',
  selector: `editor-block`
})
export class BlockComponent implements OnInit {
  @Input() public languageModel: LanguageModel;
  @Input() public node: Node;
  @Input() public visual: EditorBlockDescriptions.EditorBlockBase;

  ngOnInit() {

  }
}
