import { Component, Input, HostBinding, OnChanges } from '@angular/core';

import { Node, CodeResource } from '../../../shared/syntaxtree';
import { BlockLanguage } from '../../../shared/block';

import { RenderedCodeResourceService } from './rendered-coderesource.service';

/**
 * Renders all editor blocks that are mandated by the given node.
 */
@Component({
  templateUrl: 'templates/block-host.html',
  selector: `editor-block-host`,
  providers: [RenderedCodeResourceService]
})
export class BlockHostComponent implements OnChanges {

  @Input()
  codeResource: CodeResource;

  /**
   * The node that represents the root of the tree to display.
   */
  @Input()
  node: Node;

  /**
   * The block language to display this tree
   */
  @Input()
  blockLanguage: BlockLanguage;

  /**
   * Disables any interaction with this block if true.
   */
  @Input()
  readOnly = false;

  @HostBinding('class')
  get hostCssClasses() {
    return (this.blockLanguage.rootCssClasses.join(" "));
  }

  constructor(
    private _renderedCodeResourceService: RenderedCodeResourceService
  ) { }

  ngOnChanges() {
    this._renderedCodeResourceService._updateRenderData(
      this.codeResource, this.blockLanguage, this.readOnly
    )
  }

  readonly renderDataAvailable$ = this._renderedCodeResourceService.dataAvailable$;

  /**
   * @return The visual editor block that should be used to represent the node.
   */
  get editorBlock() {
    return (this.blockLanguage.getEditorBlock(this.node.qualifiedName));
  }
}
