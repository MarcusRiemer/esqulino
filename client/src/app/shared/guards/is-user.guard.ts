import { CanActivate, UrlTree, Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { take } from "rxjs/operators";

import { UserService } from "../auth/user.service";
import { Roles } from "../authorisation/roles.enum";

@Injectable()
export class IsUserGuard implements CanActivate {
  constructor(private _router: Router, private _userService: UserService) {}

  public async canActivate(): Promise<boolean | UrlTree> {
    console.log("UserRole -> ?");
    const roles = await this._userService.roles$.pipe(take(1)).toPromise();

    console.log(`UserRoles -> ${roles}`);
    if (!roles.includes(Roles.Admin) && !roles.includes(Roles.User)) {
      return this._router.parseUrl("/");
    }
    return true;
  }
}
