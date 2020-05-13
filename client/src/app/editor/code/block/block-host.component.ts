import { Component, Input, HostBinding, OnChanges } from "@angular/core";

import { Node, CodeResource } from "../../../shared/syntaxtree";
import { BlockLanguage } from "../../../shared/block";

import { RenderedCodeResourceService } from "./rendered-coderesource.service";

/**
 * Renders all editor blocks that are mandated by the given node.
 */
@Component({
  templateUrl: "templates/block-host.html",
  selector: `editor-block-host`,
  providers: [RenderedCodeResourceService],
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
   * The block language to display this tree. If left undefined, the block language
   * is determined based on the code resource.
   */
  @Input()
  blockLanguage: BlockLanguage;

  /**
   * Disables any interaction with this block if true.
   */
  @Input()
  readOnly = false;

  @Input()
  validationContext: any = undefined;

  @HostBinding("class")
  get hostCssClasses() {
    const usedBlockLanguage = this._renderedCodeResourceService.blockLanguage;
    return usedBlockLanguage.rootCssClasses.join(" ");
  }

  constructor(
    private _renderedCodeResourceService: RenderedCodeResourceService
  ) {}

  ngOnChanges() {
    this._renderedCodeResourceService._updateRenderData(
      this.codeResource,
      this.blockLanguage,
      this.readOnly,
      this.validationContext || {}
    );
  }

  readonly renderDataAvailable$ = this._renderedCodeResourceService
    .dataAvailable$;

  /**
   * @return The visual editor block that should be used to represent the node.
   */
  get editorBlock() {
    // We can trust the rendered code service here, because it is updated
    // by this very component.
    const usedBlockLanguage = this._renderedCodeResourceService.blockLanguage;
    return usedBlockLanguage.getEditorBlock(this.node.qualifiedName);
  }
}
