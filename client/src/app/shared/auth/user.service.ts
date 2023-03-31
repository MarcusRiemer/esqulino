import { Injectable } from "@angular/core";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { MatLegacySnackBar as MatSnackBar } from "@angular/material/legacy-snack-bar";

import { Observable, of, Subject, BehaviorSubject } from "rxjs";
import { map, first, catchError, filter } from "rxjs/operators";

import { ServerDataService } from "../serverdata/server-data.service";
import { UserDescription } from "./user.description";
import { ServerProviderDescription } from "./provider.description";
import { AuthDialogComponent } from "./auth-dialog.component";

@Injectable()
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
    // Trigger retrieval of initial user data
    this._serverData.getUserData
      .pipe(
        filter((u) => !!u) // Don't set empty users, logout is handled via the interceptor
      )
      .subscribe((newUser) => {
        this.fireUserData(newUser);

        // If this is not the guest user: Grab its identities
        if (newUser.userId !== UserService.GUEST_ID) {
          this._serverData.getIdentities
            .pipe(first())
            .subscribe((i) => this.fireIdentities(i));
        }
      });
  }

  private _unexpectedLogout$ = new Subject<void>();
  private _cachedUserData = new BehaviorSubject<UserDescription>(undefined);
  private _cachedIdentities = new BehaviorSubject<ServerProviderDescription>(
    undefined
  );

  private fireUserData(userData: UserDescription) {
    this._cachedUserData.next(userData);
  }

  private fireIdentities(identities: ServerProviderDescription) {
    this._cachedIdentities.next(identities);
  }

  readonly userData$ = this._cachedUserData
    .asObservable()
    .pipe(filter((u) => !!u));

  readonly identities = this._cachedIdentities.asObservable();
  readonly unexpectedLogout$ = this._unexpectedLogout$.asObservable();

  public onUnexpectedLogout(newUserData: UserDescription) {
    this._unexpectedLogout$.next();
    this._cachedUserData.next(newUserData);
  }

  /**
   * @return The Name of the currently authenticated user
   */
  readonly userDisplayName$ = this.userData$.pipe(
    // Error value if something breaks down horribly (server error, network outage, ...).
    catchError((_) => of({ displayName: "userDisplayName: Unknown Error" })),
    map((u) => u.displayName)
  );

  /**
   * @return The ID of the currently authenticated user
   */
  readonly userId$ = this.userData$.pipe(
    catchError((_) => of({ userId: UserService.GUEST_ID })),
    map((u) => u.userId)
    // Assume guest id if something breaks down horribly (server error, network outage, ...).
  );

  /**
   * Instead of relying on roles, the (seldomly used) check for the login state
   * relies on the guest user ID.
   */
  readonly isLoggedIn$ = this.userId$.pipe(
    map((id) => id !== UserService.GUEST_ID)
  );

  readonly roles$ = this.userData$.pipe(
    // Assume guest ID if something breaks down horribly (server error, network outage, ...).
    catchError((_) => of({ roles: ["guest"] })),
    map((u) => u.roles)
  );

  readonly primaryEmail$ = this.identities.pipe(
    filter((u) => !!u),
    map((u) => u.primary)
  );

  readonly providers$ = this.identities.pipe(
    filter((u) => !!u),
    map((u) => u.providers)
  );

  /**
   * Log out a logged in user
   */
  public async logout() {
    const userData = await this._serverData.logout();
    this.fireUserData(userData);
    this._snackBar.open("Succesfully logged out", "", { duration: 3000 });
  }

  public loggedOutDialog(): Observable<any> {
    return this._matDialog
      .open(AuthDialogComponent, {
        data: {
          type: "signIn",
          message: "You were logged out",
          message_type: "error",
        },
      })
      .afterClosed()
      .pipe(first());
  }
}
