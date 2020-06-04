import { Component } from "@angular/core";

import { CurrentCodeResourceService } from "../current-coderesource.service";
import { switchMap, map } from "rxjs/operators";

/**
 * Shows the JSON representation of a certain resource
 */
@Component({
  templateUrl: "templates/json-ast.html",
})
export class JsonAstComponent {
  constructor(private _currentCodeResource: CurrentCodeResourceService) {}

  readonly jsonTree$ = this._currentCodeResource.currentResource.pipe(
    switchMap((c) => c.syntaxTree),
    map((t) => t.toModel())
  );
}
