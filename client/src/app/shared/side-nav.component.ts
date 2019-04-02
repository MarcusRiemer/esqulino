import { Component, Inject, LOCALE_ID, Input, ViewChild, ElementRef, EventEmitter, Output, AfterViewInit } from "@angular/core";
import { BrowserService } from './browser.service';
import { NavItem } from './nav-interfaces';
import { MatSidenav } from '@angular/material';

@Component({
  selector: 'side-nav-selector',
  templateUrl: './templates/side-nav.html'
})

export class SideNavComponent {
  @Input('items') navItems: NavItem;

  constructor(
    @Inject(LOCALE_ID) private readonly _localeId: string,
  ) { }

  // The actual locale that is currently in use
  readonly locale = this._localeId;
}
 