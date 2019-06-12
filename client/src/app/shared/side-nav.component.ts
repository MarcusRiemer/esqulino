import { ToolbarService } from './toolbar.service';
import { Component, Inject, LOCALE_ID, Input, ViewChild, OnInit } from "@angular/core";
import { BrowserService } from './browser.service';

import { NavItem } from './nav-interfaces';
import { interval, Subject } from 'rxjs';
import { MatSidenav } from '@angular/material';
import { first } from 'rxjs/operators';

@Component({
  selector: 'side-nav-selector',
  templateUrl: './templates/side-nav.html'
})

export class SideNavComponent {
  @Input('items') navItems: NavItem;

  @ViewChild('sideNav', { static: false }) sidenav: MatSidenav;

  /**
   * Used for dependency injection
   */
  constructor(
    @Inject(LOCALE_ID) private readonly _localeId: string,
    private readonly _browser: BrowserService,
    private readonly _toolbarService: ToolbarService
  ) {
    this._toolbarService.sideNav$
      .subscribe(_ =>
        this.sidenav.toggle()
      )
  }

  // Pass through: Mobile device detection
  readonly isMobile$ = this._browser.isMobile$;

  // Pass through: Rendering mode for sidebar
  readonly sidebarMode$ = this._browser.sidebarMode$;

  // The actual locale that is currently in use
  readonly locale = this._localeId;
}
