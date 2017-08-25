import { Component } from '@angular/core'
import { Http, Response, Headers } from '@angular/http'

import { ServerApiService } from '../../shared/serverapi.service'

import { ProjectService } from '../../editor/project.service'

interface AvailableImage {
    "id": string;
    "image-name": string;
    "image-url": string;
    "author-name": string;
    "author-url": string;
}

@Component({
  templateUrl: 'templates/image-list.html'
})
export class ImageListComponent {
  private _imageList: AvailableImage[];

  private _serverApi: ServerApiService

  constructor(
    serverApi: ServerApiService,
    private _http: Http,
    private _projectService: ProjectService
  ) {
      this._serverApi = serverApi;
  }

    refreshCache() {
        const projectId = this._projectService.cachedProject.id;

        this._http.get(this._serverApi.getImageListUrl(projectId))
            .map(res => res.json() as AvailableImage[])
            .subscribe(res => {
                this._imageList = res;
            });
    }

    ngOnInit() {
        this.refreshCache();
    }

  get images() {
    return (this._imageList);
  }
}
