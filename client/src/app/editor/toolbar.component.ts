import { Component } from '@angular/core';

import { ToolbarService } from './toolbar.service';
import { PreferencesService } from './preferences.service';
import { BlockDebugOptionsService } from './block-debug-options.service';

@Component({
  templateUrl: 'templates/toolbar.html',
  selector: 'editor-toolbar',
})
export class ToolbarComponent {
  constructor(
    private _toolbarService: ToolbarService,
    private _preferences: PreferencesService,
    readonly debugOptions: BlockDebugOptionsService,
  ) { }

  get toolbarService() {
    return (this._toolbarService);
  }

  toggleNavbar() {
    console.log("Editor-Toolbar: Sidenav toggled");
    this._preferences.toggleSideNav();
  }
}
