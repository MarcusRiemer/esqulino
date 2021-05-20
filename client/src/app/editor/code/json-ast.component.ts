import { Component } from "@angular/core";

import { CurrentCodeResourceService } from "../current-coderesource.service";
import { switchMap, map, first } from "rxjs/operators";

/**
 * Shows the JSON representation of a certain resource
 */
@Component({
  templateUrl: "templates/json-ast.html",
  styleUrls: ["json-ast.component.scss"],
})
export class JsonAstComponent {
  constructor(private _currentCodeResource: CurrentCodeResourceService) {}

  readonly jsonTree$ = this._currentCodeResource.currentResource.pipe(
    switchMap((c) => c.syntaxTree$),
    map((t) => t.toModel())
  );

  readonly hasClipboard = !!navigator.clipboard;

  async copyToClipboard() {
    if (this.hasClipboard) {
      const content = await this.jsonTree$.pipe(first()).toPromise();
      await navigator.clipboard.writeText(
        JSON.stringify(content, undefined, 2)
      );

      console.log("Copied the following AST to the clipboard", content);
    } else {
      alert("Sorry, no clipboard availabe");
    }
  }
}
