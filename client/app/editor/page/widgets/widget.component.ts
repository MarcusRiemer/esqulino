import {SidebarService}                 from '../../sidebar.service'

/**
 * Base class for all widget visualizations. Exposes the model itself and
 * stores the editing state.
 */
export class WidgetComponent<TModel> {
    private _model : TModel;
    private _isEditing : boolean;

    constructor(private _sidebarService : SidebarService) {

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
        if (!this._isEditing) {
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

    }

    /**
     * This method is meant to be overwritten by specialised classes and
     * allows reacting to editing events. The default implementation
     * resets the sidebar to show the "normal" page sidebar.
     */
    protected onStopEditing() {

    }
}
