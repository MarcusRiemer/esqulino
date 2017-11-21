import { Component, Input, OnInit } from '@angular/core';

import { Node, NodeLocation, Tree } from '../../../shared/syntaxtree';
import { LanguageModel, EditorBlock } from '../../../shared/block';

@Component({
  templateUrl: 'templates/block.html',
  selector: `editor-block`
})
export class BlockComponent implements OnInit {

  @Input() public languageModel: LanguageModel;
  @Input() public node: Node;
  @Input() public editorBlock: EditorBlock;

  ngOnInit() {
    if (!this.editorBlock) {
      this.editorBlock = this.languageModel.getEditorBlock(this.node.qualifiedName);
    }
  }

  get blockType() {
    try {
      return this.editorBlock.blockType;
    } catch (e) {
      return (undefined);
    }
  }

}
