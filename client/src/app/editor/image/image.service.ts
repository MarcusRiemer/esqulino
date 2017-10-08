import { Injectable } from '@angular/core'
import { Http, Response, Headers } from '@angular/http'

import { ServerApiService } from '../../shared/serverapi.service'

import { ProjectService } from '../project.service'

import { AvailableImage, AvailableImageDescription } from './available-image.class'

//export { AvailableImage }

@Injectable()
export class ImageService {
  private _imageList: AvailableImage[];

  constructor(
    private _serverApi: ServerApiService,
    private _projectService : ProjectService,
    private _http: Http
  ){
  };

  loadImageList() {
    let project = this._projectService.cachedProject

    this._http.get(this._serverApi.getImageListUrl(project.id))
          .map(res => res.json() as AvailableImageDescription[])
          .map(res => res.map(img => new AvailableImage(this._serverApi, project, img)))
          .subscribe(res => this._imageList = res);
  }

  get images() {
    return (this._imageList);
  }

}

