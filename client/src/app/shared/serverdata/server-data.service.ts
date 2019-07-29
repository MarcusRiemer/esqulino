import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { first, tap } from 'rxjs/operators';

import { NewsFrontpageDescription, NewsUpdateDescription } from '../news.description';
import { NewsDescription } from '../news.description';
import { UserDescription } from '../auth/user.description';

import { ServerApiService } from './serverapi.service';
import { IndividualDescriptionCache, CachedRequest } from './request-cache';
import { SignUpDescription, SignInDescription, ChangePasswordDescription } from './../auth/auth-description';
import { ServerProviderDescription, ChangePrimaryEmailDescription } from '../auth/provider.description';
import { UserEmailDescription, UserPasswordDescription, UserNameDescription, UserAddEmailDescription } from './../auth/user.description';
import { ClientProviderDescription } from './../auth/provider.description';
import { MayPerformRequestDescription, MayPerformResponseDescription } from './../may-perform.description';



/**
 * Convenient and cached access to server side descriptions.
 */
@Injectable()
export class ServerDataService {
  public constructor(
    private _serverApi: ServerApiService,
    private _http: HttpClient
  ) {
  }

  readonly getUserNewsList = new CachedRequest<NewsFrontpageDescription[]>(
    this._http.get<NewsFrontpageDescription[]>(this._serverApi.getUserNewsListUrl())
  );

  readonly getAdminNewsList = new CachedRequest<NewsDescription[]>(
    this._http.get<NewsDescription[]>(this._serverApi.getAdminNewsListUrl())
  );

  readonly getAdminNewsSingle = new IndividualDescriptionCache<NewsDescription>(
    this._http,
    id => this._serverApi.getAdminNewsSingle(id)
  );

  readonly getUserNewsDetails = new IndividualDescriptionCache<NewsFrontpageDescription>(
    this._http,
    id => this._serverApi.getNewsSingle(id)
  );



  // TODO COMMENTS

  readonly getUserData = new CachedRequest<UserDescription>(
    this._http.get<UserDescription>(this._serverApi.getUserDataUrl())
  );

  readonly getIdentities = new CachedRequest<ServerProviderDescription>(
    this._http.get<ServerProviderDescription>(this._serverApi.getUserIdentitiesUrl())
  )

  readonly getProviders = new CachedRequest<ClientProviderDescription[]>(
    this._http.get<ClientProviderDescription[]>(this._serverApi.getProvidersUrl())
  )

  changeRoles$(userId: string): Observable<UserDescription> {
    return this._http.post<UserDescription>(this._serverApi.getChangeRolesUrl(), { "userId": userId })
  }

  signUp$(data: SignUpDescription): Observable<UserDescription> {
    return this._http.post<UserDescription>(this._serverApi.getSignUpUrl(), data);
  }

  signIn$(data: SignInDescription): Observable<UserDescription> {
    return this._http.post<UserDescription>(this._serverApi.getSignInWithPasswordUrl(), data);
  }

  logout$(): Observable<UserDescription> {
    return this._http.delete<UserDescription>(this._serverApi.getSignOutUrl());
  }

  changePassword$(data: ChangePasswordDescription): Observable<UserDescription> {
    return this._http.patch<UserDescription>(this._serverApi.getChangePasswordUrl(), data);
  }

  passwordResetRequest$(data: UserEmailDescription): Observable<UserDescription> {
    return this._http.post<UserDescription>(this._serverApi.getPasswordResetRequestUrl(), data);
  }

  resetPassword$(data: UserPasswordDescription): Observable<UserDescription> {
    return this._http.patch<UserDescription>(this._serverApi.getPasswordResetUrl(), data);
  }

  sendChangePrimaryEmail$(data: ChangePrimaryEmailDescription): Observable<UserDescription> {
    return this._http.post<UserDescription>(this._serverApi.getChangePrimaryEmailUrl(), data)
  }

  addEmail$(data: UserEmailDescription | UserAddEmailDescription): Observable<ServerProviderDescription> {
    return this._http.post<ServerProviderDescription>(this._serverApi.getSignUpUrl(), data)
  }

  sendVerifyEmail$(data: UserEmailDescription): Observable<UserDescription> {
    return this._http.post<UserDescription>(this._serverApi.getSendVerifyEmailUrl(), data)
  }

  changeUserName$(data: UserNameDescription): Observable<UserNameDescription> {
    return this._http.patch<UserNameDescription>(this._serverApi.getChangeUserNameUrl(), data)
  }

  mayPerform$(data: MayPerformRequestDescription): Observable<MayPerformResponseDescription[]> {
    const requestData = { "list": [data] }
    return this._http.post<MayPerformResponseDescription[]>(this._serverApi.getMayPerformUrl(), requestData)
  }

  deleteEmail$(id: string): Observable<ServerProviderDescription> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: { id: id },
    };
    return this._http.delete<ServerProviderDescription>(this._serverApi.getDeleteEmailUrl(), options)
  }

  /**
   * creating a new news
   */
  createNews(desc: NewsUpdateDescription): Observable<NewsDescription> {
    // The given description may have to many fields, we need to strip
    // every unneeded field.
    desc = {
      publishedFrom: desc.publishedFrom || null,
      text: desc.text,
      title: desc.title
    };

    const url = this._serverApi.getCreateNewsUrl();
    const toReturn = this._http.post<NewsDescription>(url, desc).pipe(
      tap((desc) => {
        console.log(`Created news "${desc.id}"`);
        this.getAdminNewsList.refresh();
      })
    );

    return (toReturn);
  }

  /**
   * Updates the given news
   */
  updateNews(id: string, desc: NewsUpdateDescription): Observable<NewsDescription> {
    // The given description may have to many fields, we need to strip
    // every unneeded field.
    desc = {
      publishedFrom: desc.publishedFrom || null,
      text: desc.text,
      title: desc.title
    };

    const url = this._serverApi.getNewsUpdateUrl(id);
    const toReturn = this._http.put<NewsDescription>(url, desc).pipe(
      // Refresh our local caches
      tap(_ => {
        console.log(`Updated news "${id}"`);
        this.getAdminNewsList.refresh();
        this.getAdminNewsSingle.refreshDescription(id);
      })
    );

    return (toReturn);
  }

  /**
   * Deletes the news with the given ID.
   */
  deleteNews(id: string): Observable<Object> {
    const toReturn = this._http.delete(this._serverApi.getNewsSingle(id))
      .pipe(
        tap(_ => {
          console.log(`Deleted news "${id}"`);
          this.getAdminNewsList.refresh();
        }),
        first()
      )
    return (toReturn);
  }
}
