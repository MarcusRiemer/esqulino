import { Component, Input, OnInit } from '@angular/core';

import { Node, NodeLocation, Tree } from '../../../shared/syntaxtree';
import { LanguageModel, EditorBlockDescription } from '../../../shared/block';

/**
 * Renders all editor blocks that are mandated by the given node.
 */
@Component({
  templateUrl: 'templates/block-host.html',
  selector: `editor-block-host`
})
export class BlockHostComponent implements OnInit {

  @Input() public languageModel: LanguageModel;
  @Input() public node: Node;

  ngOnInit() {

  }

  get editorBlock() {
    return (this.languageModel.getEditorBlock(this.node.qualifiedName));
  }
}
