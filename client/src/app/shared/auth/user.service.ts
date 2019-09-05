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

  private $pipeObserv($observ: Observable<any>, action: (() => any)): Observable<any> {
    return $observ.pipe(
      first(),
      tap(
        _ => action(),
        (err) => alert(`Error: ${err["error"]["message"]}`)
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

  public signUp$(data: SignUpDescription): Observable<UserDescription> {
    return this.$pipeObserv(this._serverData.signUp$(data),
      () => alert("Please confirm your e-mail")
    )
  }

  public mayPerform$(data: MayPerformRequestDescription): Observable<MayPerformResponseDescription> {
    return this._serverData.mayPerform$(data).pipe(
      first(),
      map(r => r[0])
    )
  }

  public signIn$(data: SignInDescription): Observable<UserDescription> {
    return this.$pipeObserv(this._serverData.signIn$(data),
      () => this.userData$.refresh()
    )
  }

  public resetPassword$(data: UserPasswordDescription): Observable<UserDescription> {
    return this.$pipeObserv(this._serverData.resetPassword$(data),
     () => this.userData$.refresh()
    )
  }

  public changeUserName$(data: UserNameDescription) {
    return this.$pipeObserv(this._serverData.changeUserName$(data),
      () => {
        this._snackBar.open('Username changed', '', { duration: 3000 })
        this.userData$.refresh();
      },
    )
  }

  public changePassword$(data: ChangePasswordDescription): Observable<UserDescription> {
    return this.$pipeObserv(
      this._serverData.changePassword$(data),
      () => {
        this._snackBar.open('Password changed', '', { duration: 3000 });
        this.userData$.refresh();
      }
    )
  }

  public passwordResetRequest$(data: UserEmailDescription): Observable<UserDescription> {
    return this.$pipeObserv(this._serverData.passwordResetRequest$(data),
      () => {
        this.userData$.refresh()
        alert("Please check your e-mails")
      },
    )
  }

  public sendChangePrimaryEmail$(data: ChangePrimaryEmailDescription): Observable<UserDescription> {
    return this.$pipeObserv(this._serverData.sendChangePrimaryEmail$(data),
      () => {
        this._snackBar.open('Please confirm the e-mail', '', { duration: 5000 })
        this.userData$.refresh();
        this.identities$.refresh();
      },
    )
  }

  public deleteEmail$(uid: string): Observable<ServerProviderDescription> {
    return this.$pipeObserv(this._serverData.deleteEmail$(uid),
      () => {
        this._snackBar.open('E-Mail succesfully deleted', '', { duration: 3000 })
        this.identities$.refresh();
        this.userData$.refresh();
      }
    )
  }

  public addEmail$(data: UserEmailDescription | UserAddEmailDescription): Observable<ServerProviderDescription> {
    return this.$pipeObserv(this._serverData.addEmail$(data), 
      () => {
        this._snackBar.open('Please confirm the e-mail', '', { duration: 6000 })
        this.identities$.refresh();
        this.userData$.refresh();
      }
    )
  }

  public sendVerifyEmail$(data: UserEmailDescription): Observable<UserDescription> {
    return this.$pipeObserv(this._serverData.sendVerifyEmail$(data),
      () => this._snackBar.open('Please check your e-mails', '', { duration: 6000 })
    )
  }

  public logout$(): Observable<UserDescription> {
    return this.$pipeObserv(this._serverData.logout$(),
      () => {
        this._snackBar.open('Succesfully logged out', '', { duration: 3000 })
        this.userData$.refresh();
      }
    )
  }
}