import { UserEmailDescription, UserPasswordDescription } from './../auth/user.description';
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { first, tap } from 'rxjs/operators';

import { NewsFrontpageDescription, NewsUpdateDescription } from '../news.description';
import { NewsDescription } from '../news.description';
import { UserDescription } from '../auth/user.description';

import { ServerApiService } from './serverapi.service';
import { IndividualDescriptionCache, CachedRequest } from './request-cache';
import { SignUpDescription, SignInDescription, ChangePasswordDescription } from './../auth/auth-description';



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
    return this._http.put<UserDescription>(this._serverApi.getChangePasswordUrl(), data);
  }

  passwordResetRequest$(data: UserEmailDescription): Observable<UserDescription> {
    return this._http.post<UserDescription>(this._serverApi.getPasswordResetRequestUrl(), data);
  }

  resetPassword$(data: UserPasswordDescription): Observable<UserDescription> {
    return this._http.put<UserDescription>(this._serverApi.getPasswordResetUrl(), data);
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
