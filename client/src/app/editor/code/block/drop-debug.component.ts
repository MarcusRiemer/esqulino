import { Component } from "@angular/core";

import { DragService } from "../../drag.service";

/**
 *
 */
@Component({
  templateUrl: "templates/drop-debug.html",
})
export class DropDebugComponent {
  public readonly currentDrag$ = this._dragService.currentDrag;

  constructor(private _dragService: DragService) {}
}
