import { Component, Inject, LOCALE_ID, Input, ViewChild, OnInit, AfterViewChecked, AfterViewInit, OnDestroy } from "@angular/core";
import { BrowserService } from './browser.service';
import { MatSidenav } from '@angular/material';

import { map } from 'rxjs/operators';
import { of } from 'rxjs';

import { NavItem } from './nav-interfaces';
import { SideNavService } from './side-nav.service';
import { UserService } from './auth/user.service';

@Component({
  selector: 'side-nav-selector',
  templateUrl: './templates/side-nav.html'
})

export class SideNavComponent implements OnDestroy {
  @Input('items') navItems: NavItem[];

  @ViewChild('sideNav', { static: false }) sidenav: MatSidenav;

  /**
   * Used for dependency injection
   */
  constructor(
    @Inject(LOCALE_ID) private readonly _localeId: string,
    private readonly _browser: BrowserService,
    private readonly _sideNav: SideNavService,
    private readonly _userService: UserService
  ) { }

  readonly navItems$ = this._sideNav.sideNavItems$();

  // Checks if the user is logged in
  readonly loggedIn$ = this._userService.isLoggedIn$;

  // Pass through: Mobile device detection
  readonly isMobile$ = this._browser.isMobile$;

  // Pass through: Rendering mode for sidebar
  readonly sidebarMode$ = this._browser.sidebarMode$;

  // The actual locale that is currently in use
  readonly locale = this._localeId;

  readonly sideNavToggleSub = this._sideNav.sideNavToggle$()
    .subscribe(() => this.sidenav.toggle())

  ngOnDestroy(): void {
    this.sideNavToggleSub.unsubscribe();
  }

  /**
   * Checks whether the currently logged in user has all the requested roles.
   *
   * TODO: It would be better to filter the list of relevant nav items to
   *       factor out the *ngIf in the template. This could be perfectly
   *       described in terms of the `combineLatest` rxjs-operation.
   */
  public userHasRoles$(roles: string[]) {
    if (roles && roles.length > 0) {
      return this._userService.roles$.pipe(
        map(userRoles => roles.every(r => userRoles.includes(r)))
      );
    } else {
      // "of" is a constructor function that wraps a static value as an observable
      return (of(true));
    }
  }
}
