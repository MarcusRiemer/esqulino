import { Component } from "@angular/core";

import { CurrentCodeResourceService } from "../../current-coderesource.service";

/**
 * Settings of a single code resource
 */
@Component({
  templateUrl: "templates/code-resource-settings.html",
  selector: `code-resource-settings`,
})
export class CodeResourceSettingsComponent {
  constructor(private _currentCodeResource: CurrentCodeResourceService) {}

  /**
   * @return The resource that is currently edited
   */
  get currentResource() {
    return this._currentCodeResource.currentResource;
  }
}
