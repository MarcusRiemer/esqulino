import { Component, EventEmitter, Output } from "@angular/core";

import { ToolbarService } from "./toolbar.service";

import { environment } from "../../environments/environment";
import { UserService } from "./auth/user.service";

function urlAllowsLogin() {
  const url = new URL(window.location.href);
  return url.searchParams.has("allowLogin");
}

@Component({
  selector: "app-toolbar",
  templateUrl: "templates/toolbar.html",
})
export class ToolbarComponent {
  @Output() toggle = new EventEmitter();

  constructor(
    private _toolbarService: ToolbarService,
    private _userService: UserService
  ) {}

  get toolbarItems$() {
    return this._toolbarService.itemsPortal;
  }

  // Login is not necessarily allowed at all times
  readonly loginEnabled = environment.loginEnabled || urlAllowsLogin();

  readonly isLoggedIn$ = this._userService.isLoggedIn$;
}
