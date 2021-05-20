import { Component } from "@angular/core";
import { first, switchMap } from "rxjs/operators";

import { BlockDebugOptionsService } from "./block-debug-options.service";
import { CurrentCodeResourceService } from "./current-coderesource.service";

@Component({
  templateUrl: "templates/editor-debug-menu.html",
  selector: "editor-debug-menu",
})
export class EditorDebugMenuComponent {
  constructor(
    readonly debugOptions: BlockDebugOptionsService,
    private readonly _currentCodeResource: CurrentCodeResourceService
  ) {}

  readonly hasClipboard = !!navigator.clipboard;

  async copyCompiledToClipboard() {
    if (this.hasClipboard) {
      const content = await this._currentCodeResource.currentResource
        .pipe(
          switchMap((res) => res.generatedCode$),
          first()
        )
        .toPromise();

      await navigator.clipboard.writeText(content);
    } else {
      alert("Sorry, no clipboard availabe");
    }
  }
}
