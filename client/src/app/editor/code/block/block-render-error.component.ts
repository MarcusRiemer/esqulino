import { Component, Input } from '@angular/core';

import { map, tap } from 'rxjs/operators';

import { Node } from '../../../shared/syntaxtree';
import { VisualBlockDescriptions } from '../../../shared/block';

import { RenderedCodeResourceService } from './rendered-coderesource.service';

/**
 * Shows an error-marker if there is an error on the given node
 */
@Component({
  templateUrl: 'templates/block-render-error.html',
  selector: `editor-block-render-error`,
})
export class BlockRenderErrorComponent {
  @Input()
  public node: Node;

  @Input()
  public visual: VisualBlockDescriptions.EditorErrorIndicator;

  constructor(
    private _renderData: RenderedCodeResourceService,
  ) { }

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
  readonly nodeErrors$ = this._renderData.validationResult$.pipe(
    tap(res => console.log("Unfiltered result on ", this.node.location, ":", res)),
    map(validationResult => validationResult.getErrorsOn(this.node)),
    tap(res => console.log("Filtered result on ", this.node.location, ":", res)),
  )

  /**
   * True, if the error indicator should be shown.
   */
  readonly showIndicator$ = this.nodeErrors$.pipe(
    map(validationResult => validationResult.some(e => this.showErrorFor(e.code)))
  )

  readonly message$ = this.nodeErrors$.pipe(
    map(errors => errors.map(e => e.code).join(", "))
  )
}
