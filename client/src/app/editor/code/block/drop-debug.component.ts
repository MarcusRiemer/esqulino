import { Component } from "@angular/core";

import { DragService } from "../../drag.service";

/**
 * Displays the current state of the available drag operations that
 * are provided by the DragService.
 */
@Component({
  templateUrl: "templates/drop-debug.html",
})
export class DropDebugComponent {
  public readonly currentDrag$ = this._dragService.currentDrag;

  constructor(private _dragService: DragService) {}
}
