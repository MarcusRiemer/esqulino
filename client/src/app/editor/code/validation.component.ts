import { Component } from "@angular/core";

import { tap } from "rxjs/operators";

import { CurrentCodeResourceService } from "../current-coderesource.service";

/**
 * Informs the user about possible errors in his trees,
 */
@Component({
  templateUrl: "templates/validation.html",
})
export class ValidationComponent {
  constructor(private _currentCodeResource: CurrentCodeResourceService) {}

  readonly codeResource = this._currentCodeResource.currentResource;

  readonly result$ = this._currentCodeResource.validationResult;
}
