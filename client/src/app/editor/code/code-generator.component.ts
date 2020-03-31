import { Component } from "@angular/core";

import { CurrentCodeResourceService } from "../current-coderesource.service";

/**
 * Shows a compiled AST.
 */
@Component({
  templateUrl: "templates/code-generator.html",
  selector: "ast-code-generator",
})
export class CodeGeneratorComponent {
  constructor(private _currentCodeResource: CurrentCodeResourceService) {}

  readonly codeResource = this._currentCodeResource.currentResource;
}
