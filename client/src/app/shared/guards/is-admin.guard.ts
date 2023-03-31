import { CanActivate, Router, UrlTree } from "@angular/router";
import { Injectable } from "@angular/core";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { first } from "rxjs/operators";

import { UserService } from "./../auth/user.service";
import { Roles } from "../authorisation/roles.enum";
import { MessageDialogComponent } from "../message-dialog.component";

/**
 * Checks for the global admin role
 */
@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(
    private _router: Router,
    private _userService: UserService,
    private _matDialog: MatDialog
  ) {}

  public async canActivate(): Promise<boolean | UrlTree> {
    const roles = await this._userService.roles$.pipe(first()).toPromise();

    console.log(`IsAdminGuard check with current roles: ${roles}`);
    // If the user is not an administrator, redirect him to the frontpage
    if (!roles.includes(Roles.Admin)) {
      // Waiting for a login
      await MessageDialogComponent.alert(this._matDialog, {
        caption: $localize`:@@caption.error:Fehler`,
        description: $localize`:@@message.page-note-allowed:Sie sind nicht berechtigt diese Seite aufzurufen`,
      });

      return this._router.parseUrl("/");
    }
    return true;
  }
}
