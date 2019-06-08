import { Component, EventEmitter, Output } from '@angular/core'

import { ToolbarService } from './toolbar.service'

@Component({
  selector: "app-toolbar",
  templateUrl: "templates/toolbar.html"
})
export class ToolbarComponent {
  @Output() toggle = new EventEmitter();

  constructor(
    private _toolbarService: ToolbarService
  ) { }

  get toolbarItems$() {
    return (this._toolbarService.itemsPortal);
  }

  public navToggle(): void {
    this._toolbarService.sideNav$.next();
  }
}
