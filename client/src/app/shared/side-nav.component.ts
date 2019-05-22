import { Component, Inject, LOCALE_ID, Input } from "@angular/core";
import { NavItem } from './nav-interfaces';

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
