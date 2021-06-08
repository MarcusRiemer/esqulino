import { Component, Optional, OnInit } from "@angular/core";

import { Angulartics2Piwik } from "angulartics2/piwik";

import { UserService } from "./shared/auth/user.service";
@Component({
  selector: "sql-scratch",
  template: `
    <router-outlet></router-outlet>
  `,
})
export class SqlScratchComponent implements OnInit {
  // The piwik service needs to be required somewhere at least once,
  // otherwise it wont be loaded.
  constructor(
    @Optional()
    piwik: Angulartics2Piwik,
    private _userService: UserService
  ) {
    if (piwik) {
      piwik.startTracking();
    }
  }

  ngOnInit(): void {
    // Ensure that the user data is fetched as early as possible. Printing it for
    // debug purposes might also be helpful.
    this._userService.userData$.subscribe((val) =>
      console.log("Current user data: ", val)
    );

    this._userService.unexpectedLogout$.subscribe((_) =>
      this._userService.loggedOutDialog()
    );
  }
}
