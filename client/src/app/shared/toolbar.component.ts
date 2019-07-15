import { Component, EventEmitter, Output } from '@angular/core'

import { SideNavService } from './side-nav.service';
import { ToolbarService } from './toolbar.service'

import { environment } from '../../environments/environment';

function urlAllowsLogin() {
  const url = new URL(window.location.href);
  return (url.searchParams.has("allowLogin"));
}

@Component({
  selector: "app-toolbar",
  templateUrl: "templates/toolbar.html"
})
export class ToolbarComponent {
  @Output() toggle = new EventEmitter();

  constructor(
    private _toolbarService: ToolbarService,
    private _sideNavService: SideNavService
  ) { }

  get toolbarItems$() {
    return (this._toolbarService.itemsPortal);
  }

  public navToggle(): void {
    this._sideNavService.toggleSideNav()
  }

  // Login is not necessarily allowed at all times
  readonly loginEnabled = environment.loginEnabled || urlAllowsLogin();
}
