import { Component } from '@angular/core'
import { HttpClient } from '@angular/common/http';

import { first } from 'rxjs/operators';

import { ServerApiService } from '../../shared'
import { ProjectService } from '../project.service'
import { SidebarService } from '../sidebar.service'
import { EditorToolbarService } from '../toolbar.service'

import { ImageService } from './image.service'

@Component({
  selector: 'radio-ng-model-example',
  templateUrl: 'templates/image-list.html'
})
export class ImageListComponent {
  availableDisplayTypes = [
    'list',
    'card'
  ];

  displayNames = {
    'card': "Gallerie",
    'list': "Liste"
  }

  currentDisplayType = this.availableDisplayTypes[0];

  imageNameFilter = "";
  authorNameFilter = "";
  licenceNameFilter = "";

  constructor(
    private _serverApi: ServerApiService,
    private _http: HttpClient,
    private _projectService: ProjectService,
    private _imageService: ImageService,
    private _sidebarService: SidebarService,
    private _toolbarService: EditorToolbarService
  ) {
  }

  ngOnInit() {
    this._sidebarService.hideSidebar();
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;

    this._imageService.loadImageList();
  }

  deleteImage(image_id: string, image_name: string) {
    if (confirm('"' + image_name + '"' + " löschen?")) {
      this._http.delete(this._serverApi.getImageDeleteUrl(this._projectService.cachedProject.slug, image_id))
        .pipe(first())
        .subscribe(res => {
          console.log(res);
          //TODO handle failure
          this._imageService.loadImageList();
        });
    }
  }

  get images() {
    if (!this._imageService.images) return [];

    return ((this._imageService.images).filter(
      img =>
        (this.imageNameFilter == "" || img.name.toLowerCase().indexOf(this.imageNameFilter.toLowerCase()) >= 0) &&
        (this.authorNameFilter == "" || img.authorName.toLowerCase().indexOf(this.authorNameFilter.toLowerCase()) >= 0) &&
        (this.licenceNameFilter == "" || img.licenceName.toLowerCase().indexOf(this.licenceNameFilter.toLowerCase()) >= 0)
    ));
  }

}
