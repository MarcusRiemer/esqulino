import { CanActivate, Router, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { first } from 'rxjs/operators';

import { UserService } from './../auth/user.service';
import { Roles } from '../authorisation/roles.enum';
import { MessageDialogComponent } from '../message-dialog.component';

/**
 * Checks for the global admin role
 */
@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(
    private _router: Router,
    private _userService: UserService,
    private _matDialog: MatDialog
  ) { }

  public async canActivate(): Promise<boolean | UrlTree> {
    const roles = await this._userService.roles$
      .pipe(first())
      .toPromise()

    console.log(`Current roles: ${roles}`);
    // If the user is not an administrator, redirect him to the frontpage
    if (!roles.includes(Roles.Admin)) {
      // Waiting for a login
      await this._matDialog
        .open(MessageDialogComponent, {
          data: {
            type: "error",
            description: "You are not allowed to visit this page."
          }
        })
        .afterClosed()
        .pipe(first())
        .toPromise();

      return this._router.parseUrl("/");
    }
    return true;
  }
}