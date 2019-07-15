import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ServerApiService } from './serverdata/serverapi.service'
import { ProjectFullDescription } from './project.description'
import { FlashService } from './flash.service'

export { ProjectFullDescription }

/**
 * Wraps access to project descriptions.
 */
@Injectable()
export class ProjectDescriptionService {
  /**
   * If a HTTP request is in progress, this is it.
   */
  private _httpRequest: Observable<ProjectFullDescription[]>;

  // The project cache
  private _cache: BehaviorSubject<ProjectFullDescription[]>;

  /**
   * @param _http Dependently injected
   */
  constructor(private _http: HttpClient,
    private _serverApi: ServerApiService,
    private _flashService: FlashService) {
    this._cache = new BehaviorSubject<ProjectFullDescription[]>([]);
  }

  /**
   * Immediatly retrieve cached projects or, if no projects are present,
   * fire up a requests for those projects.
   */
  getProjects(): Observable<ProjectFullDescription[]> {
    return (this._cache);
  }

  /**
   * Fetch a new set of projects and also place them in the cache.
   */
  fetchProjects(): Observable<ProjectFullDescription[]> {
    // Ask the server for available projects
    const uri = this._serverApi.getProjectListUrl();
    this._httpRequest = this._http.get<ProjectFullDescription[]>(uri)
      .pipe(
        catchError(err => {
          this._flashService.addMessage({
            caption: "Fehler beim Laden der Projekte: ",
            text: err.toString(),
            type: "danger"
          });

          return ([]);
        })
      );

    this._httpRequest.subscribe(projects => {
      this._cache.next(projects)
      this._httpRequest = null
    });

    return (this._cache);
  }
}
