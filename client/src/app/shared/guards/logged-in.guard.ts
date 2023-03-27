import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { Injectable } from "@angular/core";
import { first } from "rxjs/operators";

import { AuthDialogComponent } from "./../auth/auth-dialog.component";
import { UserService } from "../auth/user.service";

/**
 *Guard to protect routes, that are only to be seen as a logged in user
 */
@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor(
    private _userService: UserService,
    private _router: Router,
    private _matDialog: MatDialog
  ) {}

  public async canActivate(): Promise<true | UrlTree> {
    console.log(`LoggedIn Guard -> ?`);
    const loggedIn = await this._userService.isLoggedIn$
      .pipe(first())
      .toPromise();

    console.log(`LoggedIn Guard -> ${loggedIn}`);

    if (!loggedIn) {
      // Waiting for a login
      await this._matDialog
        .open(AuthDialogComponent, {
          data: {
            type: "signIn",
            message: "You need to login to view this content!",
            message_type: "error",
          },
        })
        .afterClosed()
        .pipe(first())
        .toPromise();
      // After closing without sign in redirecting to base url
      console.log("Dialog closed");
      return this._router.parseUrl("/");
    }
    return true;
  }
}
