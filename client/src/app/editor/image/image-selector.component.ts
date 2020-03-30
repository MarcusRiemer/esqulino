import { Component, EventEmitter, Input, Output } from "@angular/core";

import { ImageService } from "./image.service";
import { AvailableImage } from "./available-image.class";
import { Project } from "../project.service";

export { AvailableImage };

/**
 * Allows to select a specific image from the list of available images.
 */
@Component({
  templateUrl: "templates/image-selector.html",
  selector: "image-selector",
})
export class ImageSelectorComponent {
  @Output()
  projectImageIdChange = new EventEmitter<string>();

  @Input()
  public project: Project;

  private _projectImageId: string;

  constructor(private _imageService: ImageService) {}

  /**
   * @return The ID of the currently selected image.
   */
  @Input() get projectImageId() {
    return this._projectImageId;
  }

  /**
   * Sets the new image and broadcasts the change
   */
  set projectImageId(value: string) {
    this._projectImageId = value;
    this.projectImageIdChange.emit(value);
  }

  /**
   * @return The data of the image that is currently selected.
   */
  get currentImage() {
    return this.images.find((c) => c.id === this.projectImageId);
  }

  ngOnInit() {
    this._imageService.loadImageList();
  }

  get images() {
    return this._imageService.images || [];
  }
}
