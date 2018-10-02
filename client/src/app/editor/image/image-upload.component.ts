import { Component } from '@angular/core'
import { Http } from '@angular/http'
import { Router, ActivatedRoute } from '@angular/router'

import { ServerApiService } from '../../shared/serverapi.service'

import { ProjectService } from '../../editor/project.service'


@Component({
  templateUrl: 'templates/image-upload.html'
})
export class ImageUploadComponent {

  constructor(
    private _serverApi: ServerApiService,
    private _http: Http,
    private _projectService: ProjectService,
    private _router: Router,
    private _routeParams: ActivatedRoute
  ) {
  }

  onUploadSubmit(event: Event) {
    event.preventDefault();

    // TODO: Wrap server interaction in an ImageService
    const formData = new FormData(event.target as HTMLFormElement);
    const projectId = this._projectService.cachedProject.slug;

    this._http.post(this._serverApi.getImageUploadUrl(projectId), formData)
      .subscribe(res => {
        console.log(res);
        //TODO handle failure
        this._router.navigate(["../"], { relativeTo: this._routeParams });
      });
  }
}
