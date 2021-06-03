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
    private _preferences: PreferencesService,
    readonly toolbarService: EditorToolbarService,
    readonly debugOptions: BlockDebugOptionsService
  ) {}

  toggleNavbar() {
    console.log("Editor-Toolbar: Sidenav toggled");
    this._preferences.toggleSideNav();
  }
}
