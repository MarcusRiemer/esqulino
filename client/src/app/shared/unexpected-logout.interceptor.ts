import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";

import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { isUnexpectedLogoutDescription } from "./error.description";
import { UserService } from "./auth/user.service";

/**
 * In theory every single request that requires a login may fail. As encoding
 * this in the actual business logic services would be tedious, this interceptor
 * is installed globally and updates the state of the core service.
 */
@Injectable()
export class UnexpectedLogoutInterceptor implements HttpInterceptor {
  constructor(private _injector: Injector) {}

  public intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((res) => {
        // Only specific errors may log out the user
        if (
          res instanceof HttpErrorResponse &&
          isUnexpectedLogoutDescription(res.error)
        ) {
          // The user service imports the Angular HTTP service, which leads to
          // a circular reference when using this service in a HTTPInterceptor.
          // The proper solution would probably separate the global user state
          // from the globally available methods to change the state, but requiring
          // the service "later" also seems to work.
          //
          // See: https://github.com/angular/angular/issues/18224
          const userService = this._injector.get(UserService);

          console.log("Unexpected logout: ", res.error, " at URL ", res.url);
          userService.onUnexpectedLogout(res.error.newUser);
        }
      })
    );
  }
}
