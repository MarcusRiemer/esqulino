import { OpaqueToken, Type, Input } from '@angular/core'

import { SidebarService } from '../sidebar.service'
import { RegistrationService, SidebarType } from '../registration.service'

import { borderCssClass } from '../shared/page-preview.util'

import { Page } from '../../shared/page/index'
import { Widget } from '../../shared/page/widgets/index'

/**
 * Base class for all widget visualizations. Exposes the model itself and
 * stores the editing state. If a sidebar definition is supplied, the 
 * default editing action is to show that sidebar.
 */
export class WidgetComponent<TModel extends Widget> {
  private _model: TModel;
  private _isEditing: boolean;

  constructor(protected _sidebarService: SidebarService,
    model?: TModel) {
    this._model = model;
  }

  /**
   * @return A CSS-class that denots the border that should be
   *         used for this widget.
   */
  get borderCssClass(): string {
    return (borderCssClass(this.model));
  }

  /**
   * @return The model that is currently edited
   */
  get model(): TModel {
    return (this._model);
  }

  /**
   * @param value The model that should be edited.
   */
  set model(value: TModel) {
    this._model = value;
  }

  get page(): Page {
    return (this._model.page);
  }

  /**
   * @return The type-id of the sidebar this widget would use. If no such type-id is
   *         available, `undefined` is returned.
   */
  get sidebarTypeId() {
    if (this.model) {
      return (`page-${this.model.type}`);
    } else {
      return (undefined);
    }
  }

  /**
   * Puts this component into "editing mode".
   */
  startEditing() {
    if (!this._isEditing || true) {
      console.log("Started editing");

      this._isEditing = true;
      this.onBeginEditing();
    }
  }

  /**     
   * Leaves this components "editing mode".
   */
  stopEditing() {
    if (this._isEditing) {
      this._isEditing = false;
      this.onStopEditing();
    }
  }

  /**
   * This method is meant to be overwritten by specialised classes and
   * allows reacting to editing events. The default implementation
   * attempts to show a sidebar with this widget as a parameter.
   */
  protected onBeginEditing() {
    const typeId = this.sidebarTypeId;
    if (this.sidebarTypeId && this._sidebarService.isKnownType(typeId)) {
      this._sidebarService.hideNonSticky();
      this._sidebarService.showAdditionalSidebar(typeId, this);
    }
  }

  /**
   * This method is meant to be overwritten by specialised classes and
   * allows reacting to editing events. The default implementation
   * resets the sidebar to show the "normal" page sidebar.
   */
  protected onStopEditing() {

  }
}
