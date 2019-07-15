import { AuthDialogComponent } from "./../auth/auth-dialog.component";
import { MatDialog } from "@angular/material";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { Injectable } from "@angular/core";

import { UserService } from "../auth/user.service";
import { first } from "rxjs/operators";

@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor(
    private _userService: UserService,
    private _router: Router,
    private _matDialog: MatDialog
  ) { }

  public async canActivate(): Promise<true | UrlTree> {
    console.log(`LoggedIn Guard -> ?`);
    const loggedIn = await this._userService.isLoggedIn$
      .pipe(first())
      .toPromise();

    console.log(`LoggedIn Guard -> ${loggedIn}`);

    if (!loggedIn) {
      await this._matDialog
        .open(AuthDialogComponent, { data: { message: "You need to login to view this content!", type: "error" } })
        .afterClosed()
        .pipe(first())
        .toPromise();

      console.log("Dialog closed");
      return this._router.parseUrl("/");
    }
    return true;
  }
}
