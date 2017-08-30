import { Component } from '@angular/core'
import { Http, Response, Headers } from '@angular/http'

import { ServerApiService } from '../../shared/serverapi.service'

import { ProjectService } from '../../editor/project.service'

import { AvailableImage, ImageService } from './image.service'
/*interface AvailableImage {
    "id": string;
    "image-name": string;
    "image-url": string;
    "author-name": string;
    "author-url": string;
}*/

@Component({
  templateUrl: 'templates/image-list.html'
})
export class ImageListComponent {
//  private _imageList: AvailableImage[];

  constructor(
    private _serverApi: ServerApiService,
    private _http: Http,
    private _projectService: ProjectService,
    private _imageService: ImageService
  ) {
  }

/*    refreshCache() {
        const projectId = this._projectService.cachedProject.id;

        this._http.get(this._serverApi.getImageListUrl(projectId))
            .map(res => res.json() as AvailableImage[])
            .subscribe(res => {
                this._imageList = res;
            });
    }*/

  ngOnInit() {
      this._imageService.loadImageList(this._projectService.cachedProject.id);
    //this.refreshCache();
  }

  get images() {
      return (this._imageService.images);
    //return (this._imageList);
  }
}
