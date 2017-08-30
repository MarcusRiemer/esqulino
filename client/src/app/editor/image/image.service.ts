import { Injectable } from '@angular/core'
import { Http, Response, Headers } from '@angular/http'

import { ServerApiService } from '../../shared/serverapi.service'

import { AvailableImage } from './available-image'

export { AvailableImage }

@Injectable()
export class ImageService {
  private _imageList: AvailableImage[];

  constructor(
    private _serverApi: ServerApiService,
    private _http: Http
  ){
  };

  loadImageList(projectId: string) {
    this._http.get(this._serverApi.getImageListUrl(projectId))
      .map(res => res.json() as AvailableImage[])
      .subscribe(res => {
        this._imageList = res;
      });
  }

  get images() {
    return (this._imageList);
  }

}

