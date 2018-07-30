import { Component } from '@angular/core'

import { ToolbarService } from './toolbar.service'

@Component({
  selector: "app-toolbar",
  templateUrl: "templates/toolbar.html"
})
export class ToolbarComponent {
  constructor(
    private _toolbarService: ToolbarService
  ) { }

  get itemsPortal$() {
    return (this._toolbarService.itemsPortal);
  }
}
