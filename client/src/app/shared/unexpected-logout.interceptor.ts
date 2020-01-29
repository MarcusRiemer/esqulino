import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { isUnexpectedLogoutDescription } from './error.description';
import { UserService } from './auth/user.service';

import { isUserResponse } from './auth/user.description';


/**
 * In theory every single request that requires a login may fail. As encoding
 * this in the actual business logic services would be tedious, this interceptor
 * is installed globally and updates the state of the core service.
 */
@Injectable()
export class UnexpectedLogoutInterceptor implements HttpInterceptor {
  constructor(
    private _userService: UserService,
  ) { }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(res => {
        // Only specific errors may log out the user
        if (res instanceof HttpErrorResponse && isUnexpectedLogoutDescription(res.error)) {
          console.log("Unexpected logout: ", res.error, " at URL ", res.url);
          this._userService.onUnexpectedLogout(res.error.newUser);
        }
      })
    )
  }
}