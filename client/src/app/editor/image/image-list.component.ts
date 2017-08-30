import { Component } from '@angular/core'
import { Http, Response, Headers } from '@angular/http'

import { ServerApiService } from '../../shared/serverapi.service'
import { ProjectService } from '../project.service'
import { SidebarService } from '../sidebar.service'
import { ToolbarService } from '../toolbar.service'

import { AvailableImage, ImageService } from './image.service'

@Component({
  templateUrl: 'templates/image-list.html'
})
export class ImageListComponent {
  constructor(
    private _serverApi: ServerApiService,
    private _http: Http,
    private _projectService: ProjectService,
    private _imageService: ImageService,
    private _sidebarService: SidebarService,
    private _toolbarService: ToolbarService
  ) {
  }

  ngOnInit() {
    this._sidebarService.hideSidebar();
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;

    this._imageService.loadImageList(this._projectService.cachedProject.id);
  }

  get images() {
    return (this._imageService.images);
  }
}
