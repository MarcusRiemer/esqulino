import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';

import { Observable } from 'rxjs';
import { map, tap, first, } from 'rxjs/operators';

import { ServerDataService } from '../serverdata/server-data.service';
import { UserDescription, UserEmailDescription, UserPasswordDescription, UserNameDescription, UserAddEmailDescription } from './user.description';
import { SignUpDescription, SignInDescription, ChangePasswordDescription } from './auth-description';
import { ServerProviderDescription, ChangePrimaryEmailDescription } from './provider.description';
import { MayPerformResponseDescription, MayPerformRequestDescription } from './../may-perform.description';
@Injectable({ providedIn: 'root' })
export class UserService {

  /**
   * The ID of the guest account, no "normal" user will ever have this id.
   */
  static readonly GUEST_ID = "00000000-0000-0000-0000-000000000001";

  constructor(
    private _serverData: ServerDataService,
    private _snackBar: MatSnackBar
  ) { }

  public userData$ = this._serverData.getUserData;
  public identities$ = this._serverData.getIdentities;
  public providerList$ = this._serverData.getProviders;

  /**
   * Instead of relying on roles, the (seldomly used) check for the login state
   * relies on the guest user ID.
   */
  public readonly isLoggedIn$ = this.userData$.value.pipe(
    map(u => u.userId !== UserService.GUEST_ID)
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
      first(),
      tap(
        _ => alert("Please confirm your e-mail"),
        (err) => alert(`Error: ${err["error"]["message"]}`)
      )
    )
  }

  public mayPerform$(data: MayPerformRequestDescription): Observable<MayPerformResponseDescription> {
    return this._serverData.mayPerform$(data).pipe(
      first(),
      map(r => r[0])
    )
  }

  public signIn$(data: SignInDescription): Observable<UserDescription> {
    return this._serverData.signIn$(data).pipe(
      first(),
      tap(
        () => this.userData$.refresh(),
        (err) => alert(`Error: ${err["error"]["message"]}`)
      )
    )
  }

  public resetPassword$(data: UserPasswordDescription): Observable<UserDescription> {
    return this._serverData.resetPassword$(data).pipe(
      first(),
      tap(
        _ => this.userData$.refresh(),
        (err) => alert(`Error: ${err["error"]["message"]}`)
      )
    )
  }

  public changeUserName$(data: UserNameDescription) {
    return this._serverData.changeUserName$(data).pipe(
      first(),
      tap(
        _ => {
          this._snackBar.open('Username changed', '', { duration: 3000 })
          this.userData$.refresh();
        },
        (err) => alert(`Error: ${err["error"]["message"]}`)
      )
    )
  }

  public changePassword$(data: ChangePasswordDescription): Observable<UserDescription> {
    return this._serverData.changePassword$(data).pipe(
      first(),
      tap(
        _ => {
          this._snackBar.open('Password changed', '', { duration: 3000 })
          this.userData$.refresh();
        },
        (err) => alert(`Error: ${err["error"]["message"]}`)
      )
    )
  }

  public passwordResetRequest$(data: UserEmailDescription): Observable<UserDescription> {
    return this._serverData.passwordResetRequest$(data).pipe(
      first(),
      tap(
        _ => {
          this.userData$.refresh()
          alert("Please check your e-mails")
        },
        (err) => alert(`Error: ${err["error"]["message"]}`)
      )
    )
  }

  public sendChangePrimaryEmail$(data: ChangePrimaryEmailDescription): Observable<UserDescription> {
    return this._serverData.sendChangePrimaryEmail$(data).pipe(
      first(),
      tap(
        _ => {
          this._snackBar.open('Please confirm the e-mail', '', { duration: 5000 })
          this.userData$.refresh();
          this.identities$.refresh();
        },
        (err) => alert(`Error: ${err["error"]["message"]}`)
      )
    )
  }

  public deleteEmail$(uid: string): Observable<ServerProviderDescription> {
    return this._serverData.deleteEmail$(uid).pipe(
      first(),
      tap(
        _ => {
          this._snackBar.open('E-Mail succesfully deleted', '', { duration: 3000 })
          this.identities$.refresh();
          this.userData$.refresh();
        },
        (err) => alert(`Error: ${err["error"]["message"]}`)
      ),
    )
  }

  public addEmail$(data: UserEmailDescription | UserAddEmailDescription): Observable<ServerProviderDescription> {
    return this._serverData.addEmail$(data).pipe(
      first(),
      tap(
        _ => {
          this._snackBar.open('Please confirm the e-mail', '', { duration: 6000 })
          this.identities$.refresh();
          this.userData$.refresh();
        },
        (err) => alert(`Error: ${err["error"]["message"]}`)
      )
    )
  }

  public sendVerifyEmail$(data: UserEmailDescription): Observable<UserDescription> {
    return this._serverData.sendVerifyEmail$(data).pipe(
      first(),
      tap(
        _ => {
          this._snackBar.open('Please check your e-mails', '', { duration: 6000 })
        },
        (err) => alert(`Error: ${err["error"]["message"]}`)
      )
    )
  }

  public logout$(): Observable<UserDescription> {
    return this._serverData.logout$().pipe(
      first(),
      tap(
        _ => {
          this._snackBar.open('Succesfully logged out', '', { duration: 3000 })
          this.userData$.refresh();
        },
        (err) => alert(`Error: ${err["error"]["message"]}`)
      )
    )
  }
}