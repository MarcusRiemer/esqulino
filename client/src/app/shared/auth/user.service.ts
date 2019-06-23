
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { map, tap, first, filter, distinct } from 'rxjs/operators';

import { ServerDataService } from '../serverdata/server-data.service';
import { UserDescription, UserEmailDescription, UserPasswordDescription, UserNameDescription, UserAddEmailDescription } from './user.description';
import { SignUpDescription, SignInDescription, ChangePasswordDescription } from './auth-description';
import { ServerProviderDescription, ChangePrimaryEmailDescription, ClientProviderDescription } from './provider.description';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private _serverData: ServerDataService,
    private _snackBar: MatSnackBar
  ) {}

  public userData$ = this._serverData.getUserData;
  public identities$ = this._serverData.getIdentities;

  public readonly isLoggedIn$ = this.userData$.value.pipe(
    map(u => u.loggedIn)
  )

  public readonly userDisplayName$ = this.userData$.value.pipe(
    map(u => u.loggedIn? u.displayName : "Guest")
  )

  public readonly primaryEmail$ = this.identities$.value.pipe(
    map(u => u.primary)
  )

  public readonly providers$ = this.identities$.value.pipe(
    map(u => u.providers)
    // distinct(i => i.forEach(e => e.data.email) )
  )

  public signUp$(data: SignUpDescription): Observable<UserDescription> {
    return this._serverData.signUp$(data).pipe(
      first()
    )
  }

  public signIn$(data: SignInDescription): Observable<UserDescription> {
    return this._serverData.signIn$(data).pipe(
      tap(
        () => this.userData$.refresh(),
        (err) => alert(`Error: ${err["error"]["error"]}`)
      )
    )
  }

  public resetPassword$(data: UserPasswordDescription): Observable<UserDescription> {
    return this._serverData.resetPassword$(data).pipe(
      tap(
        _ => this.userData$.refresh(),
        (err) => alert(`Error: ${err["error"]["error"]}`)
      )
    )
  }

  public changeUserName$(data: UserNameDescription) {
    return this._serverData.changeUserName$(data).pipe(
      tap(
        _ => {
          this._snackBar.open('Username changed', '', {duration: 3000})
          this.userData$.refresh();
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
          this.userData$.refresh();
        },
        (err) => alert(`Error: ${err["error"]["error"]}`)
      )
    )
  }

  public passwordResetRequest$(data: UserEmailDescription): Observable<UserDescription>{
    return this._serverData.passwordResetRequest$(data).pipe(
      tap(
        _ => {
          this.userData$.refresh()
          alert("Please check your e-mails")
        },
        (err) => alert(`Error: ${err["error"]["error"]}`)
      )
    )
  }

  public sendChangePrimaryEmail$(data: ChangePrimaryEmailDescription): Observable<UserDescription> {
    return this._serverData.sendChangePrimaryEmail$(data).pipe(
      tap(
        _ => {
          this._snackBar.open('Please confirm the e-mail', '', {duration: 5000})
          this.userData$.refresh();
        },
        (err) => alert(`Error: ${err["error"]["error"]}`)
      )
    )
  }

  public deleteEmail$(uid: string): Observable<ServerProviderDescription> {
    return this._serverData.deleteEmail$(uid).pipe(
      tap(
        _ => {
          this._snackBar.open('E-Mail succesfully deleted', '', {duration: 3000})
          this.identities$.refresh();
        },
        (err) => alert(`Error: ${err["error"]["error"]}`)
      )
    )
  }

  public addEmail$(data: UserEmailDescription | UserAddEmailDescription): Observable<ServerProviderDescription> {
    return this._serverData.addEmail$(data).pipe(
      tap(
        _ => {
          this._snackBar.open('Please confirm the e-mail', '', {duration: 6000})
          this.identities$.refresh();
        },
        (err) => alert(`Error: ${err["error"]["error"]}`)
      )
    )
  }

  public sendVerifyEmail$(data: UserEmailDescription): Observable<UserDescription> {
    return this._serverData.sendVerifyEmail$(data).pipe(
      tap(
        _ => {
          this._snackBar.open('Please check your e-mails', '', {duration: 6000})
        },
        (err) => alert(`Error: ${err["error"]["error"]}`)
      )
    )
  }

  public logout$(): Observable<UserDescription> {
    return this._serverData.logout$().pipe(
      tap(
        _ => {
          this._snackBar.open('Succesfully logged out', '', {duration: 3000})
          this.userData$.refresh();
        },
        (err) => alert(`Error: ${err["error"]["error"]}`)
      )
    )
  }
}