import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";

import { ServerApiService } from "../../shared";

import { ProjectService } from "../../editor/project.service";

@Component({
  templateUrl: "templates/image-upload.html",
})
export class ImageUploadComponent {
  constructor(
    private _serverApi: ServerApiService,
    private _http: HttpClient,
    private _projectService: ProjectService,
    private _router: Router,
    private _routeParams: ActivatedRoute
  ) {}

  onUploadSubmit(event: Event) {
    event.preventDefault();

    // TODO: Wrap server interaction in an ImageService
    const formData = new FormData(event.target as HTMLFormElement);
    const projectId = this._projectService.cachedProject.slug;

    this._http
      .post(this._serverApi.getImageUploadUrl(projectId), formData)
      .subscribe((_) => {
        //TODO handle failure
        this._router.navigate(["../"], { relativeTo: this._routeParams });
      });
  }
}
