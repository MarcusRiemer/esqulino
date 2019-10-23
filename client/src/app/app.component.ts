import { Component, Optional, OnInit, OnDestroy } from '@angular/core';

import { Angulartics2Piwik } from 'angulartics2/piwik';
import { UserService } from './shared/auth/user.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'sql-scratch',
  template: `<router-outlet></router-outlet>`
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
    this._userService._cachedUserData
      .subscribe(val => console.log("Subscription: "+ JSON.stringify(val)))

    this._userService.userWasLoggedOut$
      .subscribe(_ => this._userService.loggedOutDialog())
  }

}
