import { Component } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Http, Response, Headers } from '@angular/http'

import { ServerApiService } from '../../shared/serverapi.service'
import { ProjectService } from '../../editor/project.service'
import { ToolbarService } from '../toolbar.service'
import { SidebarService } from '../sidebar.service'

import { AvailableImage, AvailableImageDescription } from './available-image.class'

@Component({
    templateUrl: 'templates/image-edit.html'
})
export class ImageEditComponent {
    private _imageMetadata: AvailableImage;

    private _subscriptionRefs: any[] = [];

    constructor(
        private _serverApi: ServerApiService,
        private _http: Http,
        private _projectService: ProjectService,
        private _routeParams: ActivatedRoute,
        private _toolbarService: ToolbarService,
        private _sidebarService: SidebarService,
        private _router: Router
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
                this.reloadImage();
        });
    }

    private reloadToolbar() {
        this._toolbarService.resetItems();
        this._toolbarService.savingEnabled = false;

        let btnDelete = this._toolbarService.addButton("delete", "Löschen", "trash", "d")
        let subRef = btnDelete.onClick.subscribe(res => {
            if (confirm("Dieses Bild löschen?")) {
                this._http.delete(this._serverApi.getImageDeleteUrl(this._projectService.cachedProject.id, this._imageMetadata.id))
                    .subscribe(res => {
                        console.log(res);
                        //TODO handle failure
                        this._router.navigate(["../../"], { relativeTo: this._routeParams });
                    })
            }
        });
        this._subscriptionRefs.push(subRef);
    }

    reloadImage() {
        this._routeParams.params.subscribe(params => {
            const projectId = this._projectService.cachedProject.id;
            console.log("imageId: " + params['imageId']);
            this._http.get(this._serverApi.getImageMetadataUrl(projectId, params['imageId']))
                .map(res => res.json() as AvailableImageDescription)
                .subscribe(res => {
                    console.log("res: " + JSON.stringify(res));
                    this.reloadToolbar();
                    this._imageMetadata = new AvailableImage(this._serverApi, this._projectService.cachedProject, res);
                });
        });
    }

    ngOnInit() {
        // Ensure sane default state
        this._sidebarService.hideSidebar();
        this._toolbarService.resetItems();
        this._toolbarService.savingEnabled = false;

        this.reloadImage();
    }

    ngOnDestroy() {
        this._subscriptionRefs.forEach(ref => ref.unsubscribe());
        this._subscriptionRefs = [];
    }

    get image() {
        return (this._imageMetadata);
    }
}

