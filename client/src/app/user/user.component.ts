import { Component } from "@angular/core";

import { SideNavService } from "../shared/side-nav.service";

@Component({
  templateUrl: "./templates/user-index.html",
})
export class UserComponent {
  constructor(private _sideNavService: SideNavService) {}

  public navToggle(): void {
    this._sideNavService.toggleSideNav();
  }
}
