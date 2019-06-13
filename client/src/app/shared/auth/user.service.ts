import { SignUpDescription, SignInDescription, ChangePasswordDescription } from './auth-description';
import { Injectable } from '@angular/core';

import { ServerDataService } from '../serverdata/server-data.service';
import { map, tap, first } from 'rxjs/operators';
import { UserDescription, UserEmailDescription, UserPasswordDescription } from './user.description';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private _serverData: ServerDataService
  ) {}

  public userData = this._serverData.getUserData

  public readonly isLoggedIn$ = this.userData.value.pipe(
    map(u => u.loggedIn)
  )

  public readonly userDisplayName$ = this.userData.value.pipe(
    map(u => u.loggedIn? u.displayName : "Guest")
  )

  public signUp$(data: SignUpDescription): Observable<UserDescription> {
    return this._serverData.signUp$(data).pipe(
      first()
    )
  }

  public signIn$(data: SignInDescription): Observable<UserDescription> {
    return this._serverData.signIn$(data).pipe(
      tap(_ => {
        console.log("logged in");
        this.userData.refresh();
      })
    )
  }

  public resetPassword$(data: UserPasswordDescription): Observable<UserDescription> {
    return this._serverData.resetPassword$(data).pipe(
      tap(_ => {
        this.userData.refresh();
      })
    )
  }

  public changePassword$(data: ChangePasswordDescription): Observable<UserDescription>{
    return this._serverData.changePassword$(data).pipe(
      tap(_ => {
        this.userData.refresh();
      })
    )
  }

  public passwordResetRequest$(data: UserEmailDescription): Observable<UserDescription>{
    return this._serverData.passwordResetRequest$(data).pipe(
      tap(_ => {
        this.userData.refresh();
      })
    )
  }

  public logout$(): Observable<UserDescription> {
    return this._serverData.logout$().pipe(
      tap(_ => {
        console.log("logged out");
        this.userData.refresh();
      })
    )
  }
}