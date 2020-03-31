import { PerformDataService } from "./../../../shared/authorisation/perform-data.service";
import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

import { UserService } from "../../../shared/auth/user.service";
import { ServerProviderDescription } from "../../../shared/auth/provider.description";
import { AddEmailDialogComponent } from "./add-email-dialog.component";
@Component({
  templateUrl: "./templates/account-settings.html",
})
export class AccountSettingsComponent {
  constructor(
    private _userService: UserService,
    private _dialog: MatDialog,
    private _performDataService: PerformDataService
  ) {}

  public performData = {
    changeUsername: this._performDataService.settings.changeUsername(),
    changePrimaryEmail: this._performDataService.settings.changePrimaryEmail(),
    changePassword: this._performDataService.settings.changePassword(),
    displayLinkedProviders: this._performDataService.settings.linkedIdentities(),
    availableProviders: this._performDataService.settings.listProviders(),
  };

  // Linked identities
  public identities = this._userService.identities;

  public onTrigger(identities: ServerProviderDescription): void {
    // If there exists no identity with password, ask for password
    this._dialog.open(AddEmailDialogComponent, {
      minWidth: "20em",
      data: identities,
    });
  }
}
