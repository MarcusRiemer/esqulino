import { Component, Input } from '@angular/core';

import { map } from 'rxjs/operators';

import { Node, CodeResource } from '../../../shared/syntaxtree';
import { VisualBlockDescriptions } from '../../../shared/block';

/**
 * Shows an error-marker if there is an error on the given node
 */
@Component({
  templateUrl: 'templates/block-render-error.html',
  selector: `editor-block-render-error`,
})
export class BlockRenderErrorComponent {
  @Input() public codeResource: CodeResource;
  @Input() public node: Node;
  @Input() public visual: VisualBlockDescriptions.EditorInput;

  public get nodeErrors() {
    return (this.codeResource.validationResult.pipe(
      map(validationResult => validationResult.getErrorsOn(this.node))
    ));
  }

  public get hasError() {
    return (this.nodeErrors.pipe(
      map(validationResult => validationResult.length > 0)
    ));
  }

  public get message() {
    return (this.nodeErrors.pipe(
      map(errors => errors.map(e => e.code).join(", "))
    ));
  }
}
