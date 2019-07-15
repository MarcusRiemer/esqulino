import { MayPerformResponseDescription, MayPerformRequestDescription } from './../may-perform.description';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { map, tap, first } from 'rxjs/operators';

import { ServerDataService } from '../serverdata/server-data.service';
import { UserDescription, UserEmailDescription, UserPasswordDescription, UserNameDescription, UserAddEmailDescription } from './user.description';
import { SignUpDescription, SignInDescription, ChangePasswordDescription } from './auth-description';
import { ServerProviderDescription, ChangePrimaryEmailDescription } from './provider.description';
import { Roles } from '../authorisation/roles.enum';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private _serverData: ServerDataService,
    private _snackBar: MatSnackBar
  ) { }

  public performIndex: number = 0;

  public userData$ = this._serverData.getUserData;
  public identities$ = this._serverData.getIdentities;

  /**
   * Deducing the login-state is not a 100% straightforward because users that
   * are not logged in get the "guest" role assigned. That role *should* only
   * be applicable to users that are not logged in, but for various reasons (e.g.
   * testing page display with different roles) it is entirely possible that a
   * logged-in user also has the "guest" role.
   */
  public readonly isLoggedIn$ = this.userData$.value.pipe(
    map(u => (u.roles.includes(Roles.Guest) && (u.roles.includes(Roles.User) || u.roles.includes(Roles.Admin)))
      || u.roles.includes(Roles.User)
      || u.roles.includes(Roles.Admin))
  )

  public readonly userDisplayName$ = this.userData$.value.pipe(
    map(u => u.displayName)
  )

  public readonly roles$ = this.userData$.value.pipe(
    map(u => u.roles)
  )

  public readonly primaryEmail$ = this.identities$.value.pipe(
    map(u => u.primary)
  )

  public readonly providers$ = this.identities$.value.pipe(
    map(u => u.providers)
  )

  public signUp$(data: SignUpDescription): Observable<UserDescription> {
    return this._serverData.signUp$(data).pipe(
      first()
    )
  }

  public mayPerform$(data: MayPerformRequestDescription): Observable<MayPerformResponseDescription> {
    return this._serverData.mayPerform$(data).pipe(
      first(),
      tap(_ => this.performIndex++),
      map(r => r[0])
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
          this._snackBar.open('Username changed', '', { duration: 3000 })
          this.userData$.refresh();
        },
        (err) => alert(`Error: ${err["error"]["error"]}`)
      )
    )
  }

  public changePassword$(data: ChangePasswordDescription): Observable<UserDescription> {
    return this._serverData.changePassword$(data).pipe(
      tap(
        _ => {
          this._snackBar.open('Password changed', '', { duration: 3000 })
          this.userData$.refresh();
        },
        (err) => alert(`Error: ${err["error"]["error"]}`)
      )
    )
  }

  public passwordResetRequest$(data: UserEmailDescription): Observable<UserDescription> {
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
          this._snackBar.open('Please confirm the e-mail', '', { duration: 5000 })
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
          this._snackBar.open('E-Mail succesfully deleted', '', { duration: 3000 })
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
          this._snackBar.open('Please confirm the e-mail', '', { duration: 6000 })
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
          this._snackBar.open('Please check your e-mails', '', { duration: 6000 })
        },
        (err) => alert(`Error: ${err["error"]["error"]}`)
      )
    )
  }

  public logout$(): Observable<UserDescription> {
    return this._serverData.logout$().pipe(
      tap(
        _ => {
          this._snackBar.open('Succesfully logged out', '', { duration: 3000 })
          this.userData$.refresh();
        },
        (err) => alert(`Error: ${err["error"]["error"]}`)
      )
    )
  }
}