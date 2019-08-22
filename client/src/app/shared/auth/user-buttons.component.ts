import { Router } from "@angular/router";
import { MatDialog } from "@angular/material";
import { Component } from "@angular/core";
import { first } from "rxjs/operators";

import { AuthDialogComponent } from "./auth-dialog.component";
import { UserService } from "./user.service";
@Component({
  selector: "user-buttons",
  templateUrl: "./templates/user-buttons.html"
})
export class UserButtonsComponent {
  constructor(
    private _dialog: MatDialog,
    private _userService: UserService,
    private _router: Router
  ) { }

  readonly userDisplayName$ = this._userService.userDisplayName$;

  /**
   * Opens an dialog for sign in or sign up
   */
  public openDialog(type: "signIn" | "signUp"): void {
    AuthDialogComponent.showDialog(this._dialog, { type: type });
    // If youre on the base url and your loggin in, the dialog will be closed
    this._userService.isLoggedIn$
      .pipe(first())
      .subscribe(loggedIn => {
        if (loggedIn) {
          this._dialog.closeAll();
        }
      });
  }

  /**
   * Sends an delete request and navigates back to the base url
   */
  public onLogout(): void {
    this._userService
      .logout$()
      .subscribe(_ => {
        this._router.navigate(["/"]);
      });
  }
}
