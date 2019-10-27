import { MatDialog } from '@angular/material';
import { UserService } from './auth/user.service';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { tap, first } from 'rxjs/operators';
import { isUserResponse } from './auth/user.description';
import { ServerApiService } from './serverdata';
import { isSessionExpiredErrorDescription } from './error.description';


@Injectable()
export class RequireLoggedInInterceptor implements HttpInterceptor {
  constructor(
    private _userService: UserService,
  ) {}

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    return next.handle(req).pipe(
        tap(res => {
          if (res instanceof HttpErrorResponse) {
            if (res.status == 500) {
              if (isSessionExpiredErrorDescription(res.error)) {
                console.log("Session expired");
                if (isUserResponse(res.error.newUser)) {
                  console.log("New user");
                  console.log("URL: "+ res.url);
                  this._userService.onUnexpectedLogout(res.error.newUser);
                }
              }
            }
          }
        })
    )
  }
}