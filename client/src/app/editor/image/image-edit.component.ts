import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Http, Response, Headers } from '@angular/http'

import { ServerApiService } from '../../shared/serverapi.service'
import { ProjectService } from '../../editor/project.service'

import { AvailableImage } from './available-image'
/*interface AvailableImage {
    "id": string;
    "image-name": string;
    "image-url": string;
    "author-name": string;
    "author-url": string;
}*/

@Component({
    templateUrl: 'templates/image-edit.html'
})
export class ImageEditComponent {
    private _imageMetadata: AvailableImage;

    constructor(
        private _serverApi: ServerApiService,
        private _http: Http,
        private _projectService: ProjectService,
        private _routeParams: ActivatedRoute
    ) {
    }

    onSubmit(event: Event) {
        const formData = new FormData(event.target as HTMLFormElement);
        const projectId = this._projectService.cachedProject.id;

        this._http.post(this._serverApi.getImageMetadataUrl(projectId, this._imageMetadata['id']), formData)
            .subscribe(res => {
                console.log(res);
            });
    }

    onSubmitUpload(event: Event) {
        const formData = new FormData(event.target as HTMLFormElement);
        const projectId = this._projectService.cachedProject.id;
        this._http.post(this._serverApi.getImageUrl(projectId, this._imageMetadata['id']), formData)
            .subscribe(res => {
            console.log(res)
        });
    }

    ngOnInit() {
        this._routeParams.params.subscribe(params => {
            const projectId = this._projectService.cachedProject.id;
            console.log("imageId: " + params['imageId']);
            this._http.get(this._serverApi.getImageMetadataUrl(projectId, params['imageId']))
                .map(res => res.json() as AvailableImage)
                .subscribe(res => {
                    console.log("res: " + JSON.stringify(res));
                    this._imageMetadata = res;
                });
        });
    }

    get image() {
        return (this._imageMetadata);
    }
}

