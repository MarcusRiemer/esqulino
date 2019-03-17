import { Component } from '@angular/core';

import { ToolbarService } from './toolbar.service';
import { PreferencesService } from './preferences.service';

@Component({
  templateUrl: 'templates/toolbar.html',
  selector: 'editor-toolbar',
})
export class ToolbarComponent {
  constructor(
    private _toolbarService: ToolbarService,
    private _preferences: PreferencesService,
  ) { }

  get toolbarService() {
    return (this._toolbarService);
  }

  toggleNavbar() {
    this._preferences.toggleSideNav();
  }
}
