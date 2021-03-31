import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { first, map } from "rxjs/operators";

import { ServerApiService } from "../../shared";

import { ProjectService } from "../project.service";

import {
  AvailableImage,
  AvailableImageDescription,
} from "./available-image.class";

@Injectable()
export class ImageService {
  private _imageList: AvailableImage[];

  constructor(
    private _serverApi: ServerApiService,
    private _projectService: ProjectService,
    private _http: HttpClient
  ) {}

  async loadImageList() {
    let project = this._projectService.cachedProject;

    this._imageList = await this._http
      .get<AvailableImageDescription[]>(
        this._serverApi.getImageListUrl(project.id)
      )
      .pipe(
        first(),
        map((res) =>
          res.map((img) => new AvailableImage(this._serverApi, project, img))
        )
      )
      .toPromise();
  }

  get images() {
    return this._imageList;
  }
}
