import { MatDialog } from '@angular/material';
import { UserService } from './auth/user.service';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, first, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isSessionExpiredErrorDescription } from './error.description';
import { AuthDialogComponent } from './auth/auth-dialog.component';


@Injectable()
export class RequireLoggedInInterceptor implements HttpInterceptor {
  constructor(
    private _router: Router,
    private _userService: UserService,
    private _matDialog: MatDialog
  ) {}

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    return next.handle(req).pipe(
      catchError(err => {
        if (err instanceof HttpErrorResponse) {
          debugger;
          console.log("Interceptor: error response")
          if (isSessionExpiredErrorDescription(err.error)) {
            console.log("Session expired");
            this._matDialog
            .open(AuthDialogComponent, {
              data: {
                type: "signIn",
                message: "You were logged out",
                message_type: "error"
              }
            })
            .afterClosed()
            .pipe(first())
            .subscribe(_ => {
              this._router.navigate(["/"]);
              this._userService.userData$.refresh();
            })
            // Exchange the current user data with the response
          }
        }
        return throwError(err)
      })
    )
  }
}