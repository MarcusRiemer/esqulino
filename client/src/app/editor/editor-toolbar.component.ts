import { Component } from "@angular/core";

import { EditorToolbarService } from "./toolbar.service";
import { PreferencesService } from "./preferences.service";
import { BlockDebugOptionsService } from "./block-debug-options.service";

@Component({
  templateUrl: "templates/editor-toolbar.html",
  selector: "editor-toolbar",
})
export class EditorToolbarComponent {
  constructor(
    private _toolbarService: EditorToolbarService,
    private _preferences: PreferencesService,
    readonly debugOptions: BlockDebugOptionsService
  ) {}

  get toolbarService() {
    return this._toolbarService;
  }

  toggleNavbar() {
    console.log("Editor-Toolbar: Sidenav toggled");
    this._preferences.toggleSideNav();
  }
}
