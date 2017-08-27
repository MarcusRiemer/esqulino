import { Component, Inject, Optional } from '@angular/core'

import { Image } from '../../../shared/page/widgets/index'

import { SIDEBAR_MODEL_TOKEN } from '../../editor.token'

import { WidgetComponent } from '../widget.component'

/**
 * Displays the sidebar editing component for a heading.
 */
@Component({
  templateUrl: 'templates/heading-sidebar.html',
})
export class ImageSidebarComponent {

  private _model: Image;

  constructor( @Inject(SIDEBAR_MODEL_TOKEN) com: WidgetComponent<Image>) {
    this._model = com.model;
  }

  /**
   * The model that is worked on.
   */
  get model() {
    return (this._model);
  }
}

export const IMAGE_SIDEBAR_IDENTIFIER = "page-image";

export const IMAGE_REGISTRATION = {
  typeId: IMAGE_SIDEBAR_IDENTIFIER,
  componentType: ImageSidebarComponent
}
