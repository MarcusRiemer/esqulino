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
  @Input() public visual: VisualBlockDescriptions.EditorErrorIndicator;

  /**
   * These error codes should not trigger this indicator.
   */
  private get excludedErrorCodes() {
    return (this.visual.excludedErrors || []);
  }

  /**
   * @return True, if the given error code should trigger this indicator.
   */
  private showErrorFor(code: string) {
    return (this.excludedErrorCodes.indexOf(code) < 0);
  }

  /**
   * All errors that occur on this block
   */
  public get nodeErrors() {
    return (this.codeResource.validationResult.pipe(
      map(validationResult => validationResult.getErrorsOn(this.node))
    ));
  }

  /**
   * True, if the error indicator should be shown.
   */
  public get showIndicator() {
    return (
      this.nodeErrors.pipe(
        map(validationResult => validationResult.filter(e => this.showErrorFor(e.code)).length > 0)
      )
    );
  }

  public get message() {
    return (this.nodeErrors.pipe(
      map(errors => errors.map(e => e.code).join(", "))
    ));
  }
}
