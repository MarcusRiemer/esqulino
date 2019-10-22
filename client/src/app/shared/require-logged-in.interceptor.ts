import { MatDialog } from '@angular/material';
import { UserService } from './auth/user.service';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { tap, first } from 'rxjs/operators';
import { isUserResponse } from './auth/user.description';
import { ServerApiService } from './serverdata';


@Injectable()
export class RequireLoggedInInterceptor implements HttpInterceptor {
  constructor(
    private _userService: UserService,
  ) {}

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    return next.handle(req).pipe(
        tap(data => {
          if (data instanceof HttpResponse) {
            if (isUserResponse(data.body)) {
              console.log("User response");
              console.log("URL: "+ data.url);
              console.log("Body: "+ JSON.stringify(data.body));
              this._userService.onUserDataEvent(data.body);
              
            }
          }
        })
    )
  }
}