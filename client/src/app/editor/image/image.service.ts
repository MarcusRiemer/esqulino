import { Injectable } from '@angular/core'
import { Http } from '@angular/http'

import { map } from 'rxjs/operators';

import { ServerApiService } from '../../shared/serverapi.service'

import { ProjectService } from '../project.service'

import { AvailableImage, AvailableImageDescription } from './available-image.class'

@Injectable()
export class ImageService {
  private _imageList: AvailableImage[];

  constructor(
    private _serverApi: ServerApiService,
    private _projectService: ProjectService,
    private _http: Http
  ) {
  };

  loadImageList() {
    let project = this._projectService.cachedProject

    this._http.get(this._serverApi.getImageListUrl(project.slug))
      .pipe(
        map(res => res.json() as AvailableImageDescription[]),
        map(res => res.map(img => new AvailableImage(this._serverApi, project, img)))
      )
      .subscribe(res => this._imageList = res);
  }

  get images() {
    return (this._imageList);
  }

}

