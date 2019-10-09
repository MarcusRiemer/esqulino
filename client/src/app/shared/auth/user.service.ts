import { NODE_CONVERTER } from './../syntaxtree/css/css.codegenerator';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

import { Observable, of } from 'rxjs';
import { map, tap, first, catchError } from 'rxjs/operators';

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
    private _snackBar: MatSnackBar,
    private _router: Router
  ) { }

  /**
   * Commonly used pipe operators are used in this function
   */
  private catchedError$($observ: Observable<any>): Observable<any> {
    return $observ.pipe(
      first(),
      catchError((err) => of(alert(`Error: ${err["error"]["message"]}`)))
    )
  }

  private requireLoggedIn$($observ: Observable<any>): Observable<any> {
    return $observ.pipe(
      map(data => {
        this.userData$.refresh();
        if (data.userId === UserService.GUEST_ID) {
          this._router.navigate(["/"]);
          this._snackBar.open("Bitte erneut anmelden.", '', {duration: 2000})
          throw new Error('User is logged out ( ACCESS-TOKEN expired? )'); 
        }}
      )
    )
  }

  public userData$ = this._serverData.getUserData;
  public identities$ = this._serverData.getIdentities;
  public providerList$ = this._serverData.getProviders;

  /**
   * @return The Name of the currently authenticated user
   */
  public readonly userDisplayName$ = this.userData$.value.pipe(
    map(u => u.displayName)
  )

  /**
   * @return The ID of the currently authenticated user
   */
  public readonly userId$ = this.userData$.value.pipe(
    map(u => u.userId)
  );

  /**
   * Instead of relying on roles, the (seldomly used) check for the login state
   * relies on the guest user ID.
   */
  public readonly isLoggedIn$ = this.userId$.pipe(
    map(id => id !== UserService.GUEST_ID)
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

  /**
   * Sends a http-request for the sign up of a password identity
   * @param data email, username, password
   */
  public signUp$(data: SignUpDescription): Observable<UserDescription> {
    return this.catchedError$(this._serverData.signUp$(data)).pipe(
      tap(_ => alert("Please confirm your e-mail"))
    )
  }

  /**
   * Sends a http-request to check for the authorization of ui element.
   * Server will respond with a list of authorizations
   */
  public mayPerform$(data: MayPerformRequestDescription): Observable<MayPerformResponseDescription> {
    return this._serverData.mayPerform$(data).pipe(
      first(),
      map(r => r[0])
    )
  }

  /**
   * Sends a http-request to sign in with a password identity
   * @param data email, password
   */
  public signIn$(data: SignInDescription): Observable<UserDescription> {
    return this.catchedError$(this._serverData.signIn$(data)).pipe(
      tap(_ => this.userData$.refresh())
    )
  }

  /**
   * Sends a http-request to reset the passwords
   * of all password identities linked to the logged in user.
   * @param data new password, token to reset a password
   */
  public resetPassword$(data: UserPasswordDescription): Observable<UserDescription | void> {
    const catchedError$ = this.catchedError$(this._serverData.resetPassword$(data))
    return catchedError$
  }

  /**
   * Sends a http-request to change the username
   * @param data new username
   */
  public changeUserName$(data: UserNameDescription) {
    return this._serverData.changeUserName$(data).pipe(
      tap(
        _ => { this.userData$.refresh(); this._snackBar.open('Username changed', '', { duration: 3000 }) },
        (err) => console.log(err)
      )
    )
  }

  /**
   * Sends a http-request to exchange the passwords of all linked password identities 
   * @param data current password, new password
   */
  public changePassword$(data: ChangePasswordDescription): Observable<UserDescription> {
    const catchedError$ = this.catchedError$(this._serverData.changePassword$(data))
    return this.catchedError$(catchedError$).pipe(
      tap(_ => this._snackBar.open('Password changed', '', { duration: 3000 }))
    )
  }

  /**
   * To reset a password, a password reset email needs to be sent via E-Mail
   * @param data email
   */
  public passwordResetRequest$(data: UserEmailDescription): Observable<UserDescription> {
    const catchedError$ = this.catchedError$(this._serverData.passwordResetRequest$(data))
    return catchedError$.pipe(
      tap(_ => alert("Please check your e-mails"))
    )
  }

  /**
   * If the User wants to change his primary E-Mail,
   * a confirmation email will be sent. 
   * The user has to verify the email in order to change the primary email
   * @param data new primary e-mail
   */
  public sendChangePrimaryEmail$(data: ChangePrimaryEmailDescription): Observable<UserDescription> {
    const catchedError$ = this.catchedError$(this._serverData.sendChangePrimaryEmail$(data))
    return catchedError$.pipe(
      tap(_ => {
        this._snackBar.open('Please confirm the e-mail', '', { duration: 5000 })
        this.identities$.refresh();
      })
    )
  }

  /**
   * Sends a http-request to delete a linked identitiy
   */
  public deleteIdentity$(uid: string): Observable<ServerProviderDescription> {
    const catchedError = this.catchedError$(this._serverData.deleteIdentity$(uid))
    return catchedError.pipe(
      tap(_ => {
        this._snackBar.open('E-Mail succesfully deleted', '', { duration: 3000 })
        this.identities$.refresh();
      })
    )
  }

  /**
   * Sends a http-request to add a password identity
   * @param data If a password identity exists ( email ) | email, password
   */
  public addEmail$(data: UserEmailDescription | UserAddEmailDescription): Observable<ServerProviderDescription> {
    const catchedError$ = this.catchedError$(this._serverData.addEmail$(data))
    return catchedError$.pipe(
      tap(_ => {
        this._snackBar.open('Please confirm the e-mail', '', { duration: 6000 })
        this.identities$.refresh();
      })
    )
  }

  /**
   * Sends a http-request to sent a new confirmation Email
   * @param data email
   */
  public sendVerifyEmail$(data: UserEmailDescription): Observable<UserDescription | void> {
    const catchedError = this.catchedError$(this._serverData.sendVerifyEmail$(data))
    return catchedError.pipe(
      tap(_ => this._snackBar.open('Please check your e-mails', '', { duration: 6000 }))
    )
  }

  /**
   * Log out a logged in user
   */
  public logout$(): Observable<UserDescription> {
    return this.catchedError$(this._serverData.logout$()).pipe(
      tap(_ => {
        this.userData$.refresh();
        this._snackBar.open('Succesfully logged out', '', { duration: 3000 })
      })
    )
  }
}