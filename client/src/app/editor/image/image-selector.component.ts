import { Component, EventEmitter, Input, Output } from '@angular/core'

import { ImageService } from './image.service'
import { AvailableImage } from './available-image.class'
import { Project } from '../project.service'

export { AvailableImage }

@Component({
    templateUrl: 'templates/image-selector.html',
    selector: 'image-selector'
})
export class ImageSelectorComponent {
    @Output() projectImageIdChange = new EventEmitter<string>();

    private _projectImageId: string;

    @Input() public project: Project;

    /**
      * Subscriptions that need to be released
      */
    private _subscriptionRefs: any[] = [];

    constructor(
        private _imageService: ImageService
    ){
    }

    @Input() get projectImageId() {
        return (this._projectImageId)
    }

    set projectImageId(value: string) {
        this._projectImageId = value;
        this.projectImageIdChange.emit(value);
    }

    ngOnInit() {
        this._imageService.loadImageList();
    }

    ngOnDestroy() {
        this._subscriptionRefs.forEach(ref => ref.unsubscribe());
        this._subscriptionRefs = [];
    }

    get images() {
        return (this._imageService.images);
    }
}
