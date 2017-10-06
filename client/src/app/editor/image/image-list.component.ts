import { Component } from '@angular/core'
import { Http, Response, Headers } from '@angular/http'

import { ServerApiService } from '../../shared/serverapi.service'
import { ProjectService } from '../project.service'
import { SidebarService } from '../sidebar.service'
import { ToolbarService } from '../toolbar.service'

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

        this._imageService.loadImageList();
    }

    deleteImage(image_id: string, image_name: string) {
        if (confirm('"' + image_name + '"' + " löschen?")) {
            this._http.delete(this._serverApi.getImageDeleteUrl(this._projectService.cachedProject.id, image_id))
                .subscribe(res => {
                    console.log(res);
                    //TODO handle failure
                    this._imageService.loadImageList();
                });
        }
    }

    get images() {
        return (this._imageService.images);
    }

}
