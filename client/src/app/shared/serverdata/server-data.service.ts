import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Observable } from "rxjs";
import { first } from "rxjs/operators";

import { UserDescription } from "../auth/user.description";

import { ServerApiService } from "./serverapi.service";
import {
  SignUpDescription,
  SignInDescription,
  ChangePasswordDescription,
} from "./../auth/auth-description";
import {
  ServerProviderDescription,
  ChangePrimaryEmailDescription,
} from "../auth/provider.description";
import {
  UserEmailDescription,
  UserPasswordDescription,
  UserNameDescription,
  UserAddEmailDescription,
} from "./../auth/user.description";
import { AvailableProvidersDescription } from "./../auth/provider.description";
import {
  MayPerformRequestDescription,
  MayPerformResponseDescription,
} from "./../may-perform.description";
import { ServerTasksService } from "./server-tasks.service";

/**
 * Convenient and cached access to server side descriptions.
 */
@Injectable({ providedIn: "root" })
export class ServerDataService {
  public constructor(
    private _serverApi: ServerApiService,
    private _http: HttpClient,
    private _serverTasks: ServerTasksService
  ) {}

  readonly getUserData = this._serverTasks.createRequest<UserDescription>(
    this._http.get<UserDescription>(this._serverApi.getUserDataUrl()),
    "GET " + this._serverApi.getUserDataUrl()
  );

  readonly getIdentities = this._serverTasks.createRequest<
    ServerProviderDescription
  >(
    this._http.get<ServerProviderDescription>(
      this._serverApi.getUserIdentitiesUrl()
    ),
    "GET " + this._serverApi.getUserIdentitiesUrl()
  );

  readonly getProviders = this._serverTasks.createRequest<
    AvailableProvidersDescription[]
  >(
    this._http.get<AvailableProvidersDescription[]>(
      this._serverApi.getProvidersUrl()
    ),
    "GET " + this._serverApi.getProvidersUrl()
  );

  /**
   * Changing roles as admin
   */
  changeRoles$(userId: string): Observable<UserDescription> {
    return this._http.post<UserDescription>(
      this._serverApi.getChangeRolesUrl(),
      { userId: userId }
    );
  }

  /**
   * Sign up with password
   */
  signUp$(data: SignUpDescription): Observable<UserDescription> {
    return this._http.post<UserDescription>(
      this._serverApi.getSignUpUrl(),
      data
    );
  }

  /**
   * Sign in with password
   */
  signIn$(data: SignInDescription): Observable<UserDescription> {
    return this._http.post<UserDescription>(
      this._serverApi.getSignInWithPasswordUrl(),
      data
    );
  }

  /**
   * Logging out a user
   */
  logout(): Promise<UserDescription> {
    return this._http
      .delete<UserDescription>(this._serverApi.getSignOutUrl())
      .pipe(first())
      .toPromise();
  }

  /**
   * Changing passwords of all linked password identities
   */
  changePassword$(
    data: ChangePasswordDescription
  ): Observable<UserDescription> {
    return this._http.patch<UserDescription>(
      this._serverApi.getChangePasswordUrl(),
      data
    );
  }

  /**
   * Sending password reset email
   */
  passwordResetRequest$(
    data: UserEmailDescription
  ): Observable<UserDescription> {
    return this._http.post<UserDescription>(
      this._serverApi.getPasswordResetRequestUrl(),
      data
    );
  }

  /**
   * Resetting passwords
   */
  resetPassword$(data: UserPasswordDescription): Observable<UserDescription> {
    return this._http.patch<UserDescription>(
      this._serverApi.getPasswordResetUrl(),
      data
    );
  }

  /**
   * Sending change primary e-mail
   */
  sendChangePrimaryEmail$(
    data: ChangePrimaryEmailDescription
  ): Observable<ServerProviderDescription> {
    return this._http.post<ServerProviderDescription>(
      this._serverApi.getChangePrimaryEmailUrl(),
      data
    );
  }

  /**
   * Adding password identity
   */
  addEmail$(
    data: UserEmailDescription | UserAddEmailDescription
  ): Observable<ServerProviderDescription> {
    return this._http.post<ServerProviderDescription>(
      this._serverApi.getSignUpUrl(),
      data
    );
  }

  /**
   * Sending verify mail
   */
  sendVerifyEmail$(data: UserEmailDescription): Observable<UserDescription> {
    return this._http.post<UserDescription>(
      this._serverApi.getSendVerifyEmailUrl(),
      data
    );
  }

  /**
   * Changing the current username
   */
  changeUserName$(data: UserNameDescription): Observable<UserDescription> {
    return this._http.patch<UserDescription>(
      this._serverApi.getChangeUserNameUrl(),
      data
    );
  }

  /**
   * Checks the permission of the ui element
   */
  mayPerform$(
    data: MayPerformRequestDescription
  ): Observable<MayPerformResponseDescription[]> {
    const requestData = { list: [data] };
    return this._http.post<MayPerformResponseDescription[]>(
      this._serverApi.getMayPerformUrl(),
      requestData
    );
  }

  /**
   * Deleting the given identity
   */
  deleteIdentity$(id: string): Observable<ServerProviderDescription> {
    const options = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
      body: { id: id },
    };
    return this._http.delete<ServerProviderDescription>(
      this._serverApi.getDeleteIdentityUrl(),
      options
    );
  }
}
