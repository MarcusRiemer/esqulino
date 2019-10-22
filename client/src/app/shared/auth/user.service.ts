import { Injectable } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';

import { Observable, of, Subject, BehaviorSubject, merge, ReplaySubject } from 'rxjs';
import { map, tap, first, catchError, shareReplay, finalize, filter } from 'rxjs/operators';

import { ServerDataService } from '../serverdata/server-data.service';
import { UserDescription, UserEmailDescription, UserPasswordDescription, UserNameDescription, UserAddEmailDescription } from './user.description';
import { SignUpDescription, SignInDescription, ChangePasswordDescription } from './auth-description';
import { ServerProviderDescription, ChangePrimaryEmailDescription } from './provider.description';
import { MayPerformResponseDescription, MayPerformRequestDescription } from './../may-perform.description';
import { AuthDialogComponent } from './auth-dialog.component';
@Injectable({ providedIn: 'root' })
export class UserService {

  /**
   * The ID of the guest account, no "normal" user will ever have this id.
   */
  static readonly GUEST_ID = "00000000-0000-0000-0000-000000000001";

  constructor(
    private _serverData: ServerDataService,
    private _snackBar: MatSnackBar,
    private _matDialog: MatDialog
  ) {
    this._serverData.getUserData.value.subscribe(
      serverUserData => this._cachedUserData.next(serverUserData)
    )
  }

  private _logoutInProgess = false;
  private _userWasLoggedOut$ = new Subject<void>();
  public _cachedUserData = new BehaviorSubject<UserDescription>(undefined);

  /**
   * Commonly used pipe operators are used in this function
   */
  private catchedError$($observ: Observable<any>): Observable<any> {
    return $observ.pipe(
      first(),
      catchError((err) => of(alert(`Error: ${err["error"]["message"]}`)))
    )
  }

  public userWasLoggedOut$ = this._userWasLoggedOut$.asObservable();
  public userData$ = this._cachedUserData.asObservable()
    .pipe(filter(u => !!u));

  public identities = this._serverData.getIdentities;
  public providerList = this._serverData.getProviders;

  public userWasLoggedOut() {
    this._userWasLoggedOut$.next();
  }

  public onUserDataEvent(newUserData: UserDescription) {
    const oldUserData = this._cachedUserData.value;
    if (oldUserData && oldUserData.userId !== newUserData.userId && newUserData.userId === UserService.GUEST_ID) {
      this.userWasLoggedOut();
    }
    this._cachedUserData.next(newUserData);
  }

  /**
   * @return The Name of the currently authenticated user
   */
  public readonly userDisplayName$ = this.userData$.pipe(
    // Error value if something breaks down horribly (server error, network outage, ...).
    catchError(_ => of({ displayName: "userDisplayName: Unknown Error" })),
    map(u => u.displayName),
  )

  /**
   * @return The ID of the currently authenticated user
   */
  public readonly userId$ = this.userData$.pipe(
    catchError(_ => of({ userId: UserService.GUEST_ID })),
    map(u => u.userId),
    // Assume guest id if something breaks down horribly (server error, network outage, ...).
  );

  /**
   * Instead of relying on roles, the (seldomly used) check for the login state
   * relies on the guest user ID.
   */
  public readonly isLoggedIn$ = this.userId$.pipe(
    map(id => id !== UserService.GUEST_ID)
  )

  public readonly roles$ = this.userData$.pipe(
    // Assume guest ID if something breaks down horribly (server error, network outage, ...).
    catchError(_ => of({ roles: ["guest"] })),
    map(u => u.roles),
  )

  public readonly primaryEmail$ = this.identities.value.pipe(
    map(u => u.primary)
  )

  public readonly providers$ = this.identities.value.pipe(
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
    return this.catchedError$(this._serverData.signIn$(data))
  }

  /**
   * Sends a http-request to reset the passwords
   * of all password identities linked to the logged in user.
   * @param data new password, token to reset a password
   */
  public resetPassword$(data: UserPasswordDescription): Observable<UserDescription | void> {
    return this.catchedError$(this._serverData.resetPassword$(data))
  }

  /**
   * Sends a http-request to change the username
   * @param data new username
   */
  public changeUserName$(data: UserNameDescription) {
    return this._serverData.changeUserName$(data).pipe(
      tap(
        _ => { this._snackBar.open('Username changed', '', { duration: 3000 }) },
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
        this.identities.refresh();
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
        this.identities.refresh();
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
        this.identities.refresh();
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
  public async logout() {
    try {
      this._logoutInProgess = true;
      await this._serverData.logout();
      this._snackBar.open('Succesfully logged out', '', { duration: 3000 })
    } finally {
      this._logoutInProgess = false
    }
  }

  public loggedOutDialog(): Observable<any> {
    return this._matDialog
      .open(AuthDialogComponent, {
        data: {
          type: "signIn",
          message: "You were logged out",
          message_type: "error"
        }
      })
      .afterClosed()
      .pipe(first())
  }
}