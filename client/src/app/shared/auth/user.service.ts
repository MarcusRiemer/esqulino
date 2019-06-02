import { SignUpDescription, SignInDescription } from './auth-description';
import { Injectable } from '@angular/core';

import { ServerDataService } from '../serverdata/server-data.service';
import { map, tap, first } from 'rxjs/operators';
import { UserDescription } from './user.description';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private _serverData: ServerDataService
  ) {}

  public userData = this._serverData.getUserData

  public readonly isLoggedIn = this.userData.value.pipe(
    map(u => u.loggedIn)
  )

  public readonly userDisplayName = this.userData.value.pipe(
    map(u => u.loggedIn? u.displayName : "Guest")
  )

  public onSignUp(data: SignUpDescription): Observable<UserDescription> {
    return this._serverData.onSignUp(data).pipe(
      first()
    )
  }

  public onSignIn(data: SignInDescription): Observable<UserDescription> {
    return this._serverData.onSignIn(data).pipe(
      tap(_ => {
        console.log("logged in");
        this.userData.refresh();
      })
    )
  }

  public onLogout(): Observable<UserDescription> {
    return this._serverData.onLogout().pipe(
      tap(_ => {
        console.log("logged out");
        this.userData.refresh();
      })
    )
  }
}