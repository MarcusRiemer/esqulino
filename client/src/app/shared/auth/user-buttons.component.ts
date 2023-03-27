import { Router } from "@angular/router";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { Component } from "@angular/core";

import { first } from "rxjs/operators";

import { LoginProvidersGQL } from "../../../generated/graphql";

import { ServerApiService } from "../serverdata";

import { AuthDialogComponent } from "./auth-dialog.component";
import { UserService } from "./user.service";

@Component({
  selector: "user-buttons",
  templateUrl: "./templates/user-buttons.html",
})
export class UserButtonsComponent {
  constructor(
    private _dialog: MatDialog,
    private _userService: UserService,
    private _loginProviders: LoginProvidersGQL,
    private _router: Router,
    private _serverApi: ServerApiService
  ) {}

  /**
   * Der aktuelle display-name eines Benutzers
   */
  public userDisplayName$ = this._userService.userDisplayName$;

  readonly providerList = this._loginProviders.watch().result();

  /**
   * Opens a dialog for sign in or sign up
   * Dialog: https://material.angular.io/components/dialog/overview
   */
  async openDialog(type: "signIn" | "signUp") {
    console.log("Attempting to show login dialog ...");

    const providerData = await this.providerList;
    const providerList = providerData.data.loginProviders;

    // Show a Dialog if the user can choose between multiple providers
    if (providerList.length > 1) {
      AuthDialogComponent.showDialog(this._dialog, { type: type });
      // If youre on the base url and your loggin in, the dialog will be closed#
      this._userService.isLoggedIn$.pipe(first()).subscribe((loggedIn) => {
        if (loggedIn) {
          this._dialog.closeAll();
        }
      });
    }
    // Redirect to the only provider that is available
    else if (providerList.length === 1) {
      const soleProvider = providerList[0];
      window.location.href = this._serverApi.getSignInUrl(soleProvider.urlName);
    }
  }

  /**
   * Sends a delete request and navigates back to the base url
   */
  public async onLogout() {
    await this._userService.logout();
    this._router.navigate(["/"]);
  }
}
