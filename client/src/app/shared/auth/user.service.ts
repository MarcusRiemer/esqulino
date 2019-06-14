
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { map, tap, first } from 'rxjs/operators';

import { ServerDataService } from '../serverdata/server-data.service';
import { UserDescription, UserEmailDescription, UserPasswordDescription } from './user.description';
import { SignUpDescription, SignInDescription, ChangePasswordDescription } from './auth-description';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private _serverData: ServerDataService,
    private _snackBar: MatSnackBar
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
      tap(
        user => {
          if (user.loggedIn) {
            this.userData.refresh();
            this._snackBar.open('Succesfully logged in', '', { duration: 2000 })
          }
        },
        (err) => alert(`Error: ${err["error"]["error"]}`)
      )
    )
  }

  public resetPassword$(data: UserPasswordDescription): Observable<UserDescription> {
    return this._serverData.resetPassword$(data).pipe(
      tap(
        _ => {
          this.userData.refresh();
        },
        (err) => alert(`Error: ${err["error"]["error"]}`)
      )
    )
  }

  public changePassword$(data: ChangePasswordDescription): Observable<UserDescription>{
    return this._serverData.changePassword$(data).pipe(
      tap(
        _ => {
          this._snackBar.open('Password changed', '', {duration: 3000})
          this.userData.refresh();
        },
        (err) => alert(`Error: ${err["error"]["error"]}`)
      )
    )
  }

  public passwordResetRequest$(data: UserEmailDescription): Observable<UserDescription>{
    return this._serverData.passwordResetRequest$(data).pipe(
      tap(
        _ => this.userData.refresh(),
        (err) => alert(`Error: ${err["error"]["error"]}`)
      )
    )
  }

  public logout$(): Observable<UserDescription> {
    return this._serverData.logout$().pipe(
      tap(
        _ => {
          this._snackBar.open('Succesfully logged out', '', {duration: 3000})
          this.userData.refresh();
        },
        (err) => alert(`Error: ${err["error"]["error"]}`)
      )
    )
  }
}