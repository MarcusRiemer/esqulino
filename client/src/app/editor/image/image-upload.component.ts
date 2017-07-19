import { Component } from '@angular/core'
import { Http, Response, Headers } from '@angular/http'

import { ServerApiService } from '../../shared/serverapi.service'

import { ProjectService } from '../../editor/project.service'


@Component({
  templateUrl: 'templates/image-upload.html'
})
export class ImageUploadComponent {

  constructor(
    private _serverApi: ServerApiService,
    private _http: Http,
    private _projectService: ProjectService
  ) {
  }

  onUploadSubmit(event: Event) {
    event.preventDefault();

    // TODO: Wrap server interaction in an ImageService
    const formData = new FormData(event.target as HTMLFormElement);
    const projectId = this._projectService.cachedProject.id;

    this._http.post(this._serverApi.getImageUploadUrl(projectId), formData)
      .subscribe(res => {
        console.log(res);
      });
  }
}
