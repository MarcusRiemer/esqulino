import { Component } from '@angular/core'

import { AvailableImage, ImageService } from './image.service'
import { ProjectService, Project } from '../project.service'

export { AvailableImage }

@Component({
    templateUrl: 'templates/image-selector.html',
    selector: 'image-selector'
})
export class ImageSelectorComponent {
    public project: Project;

    /**
      * Subscriptions that need to be released
      */
    private _subscriptionRefs: any[] = [];

    constructor(
        private _projectService: ProjectService,
        private _imageService: ImageService
    ){
    }

    ngOnInit() {
        let subRef = this._projectService.activeProject.subscribe(res => this.project = res);
        this._subscriptionRefs.push(subRef);

        this._imageService.loadImageList(this._projectService.cachedProject.id);
    }

    ngOnDestroy() {
        this._subscriptionRefs.forEach(ref => ref.unsubscribe());
        this._subscriptionRefs = [];
    }

    get images() {
        return (this._imageService.images);
    }
}
