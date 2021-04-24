import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";
import { first } from "rxjs/operators";

import { UserDescription } from "../auth/user.description";

import { ServerApiService } from "./serverapi.service";
import { ServerProviderDescription } from "../auth/provider.description";
import { LoginProviderDescription } from "./../auth/provider.description";
import {
  MayPerformRequestDescription,
  MayPerformResponseDescription,
} from "../authorisation/may-perform.description";

/**
 * Convenient and cached access to server side descriptions.
 */
@Injectable({ providedIn: "root" })
export class ServerDataService {
  public constructor(
    private _serverApi: ServerApiService,
    private _http: HttpClient
  ) {}

  readonly getUserData = this._http.get<UserDescription>(
    this._serverApi.getUserDataUrl()
  );

  readonly getIdentities = this._http.get<ServerProviderDescription>(
    this._serverApi.getUserIdentitiesUrl()
  );

  readonly availableProviders = this._http.get<LoginProviderDescription[]>(
    this._serverApi.getProvidersUrl()
  );

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
}
