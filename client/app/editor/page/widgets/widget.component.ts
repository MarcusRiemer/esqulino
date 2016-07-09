import {OpaqueToken, Type}              from '@angular/core'

import {SidebarService}                 from '../../sidebar.service'

/**
 * Base class for all widget visualizations. Exposes the model itself and
 * stores the editing state. If a sidebar definition is supplied, the 
 * default editing action is to show that sidebar.
 */
export class WidgetComponent<TModel> {
    private _model : TModel;
    private _isEditing : boolean;
    private _sidebarTypeId : string;

    constructor(protected _sidebarService : SidebarService,
                model : TModel,
                sidebarDefinition? : {
                    id : string,
                    type : Type
                }) {
        this._model = model;

        // TODO: Find a static place for this, there is no actual
        //       need to check this again and again for every constructed
        //       component.
        // Possibly register a sidebar definition
        if (sidebarDefinition) {
            this._sidebarTypeId = sidebarDefinition.id;
            
            if (!_sidebarService.isKnownType(sidebarDefinition.id)) {
                _sidebarService.registerType(sidebarDefinition.id, sidebarDefinition.type);
            }
        }
    }
    
    /**
     * @return The model that is currently edited
     */
    get model() {
        return (this._model);
    }

    /**
     * @param value The model that should be edited.
     */
    set model(value : TModel) {
        this._model = value;
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
     * does not do anything at all.
     */
    protected onBeginEditing() {
        if (this._sidebarTypeId) {
            this._sidebarService.showSidebar(this._sidebarTypeId, this);
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
