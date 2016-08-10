import{
    Component, Input, OnInit,
    ViewContainerRef, ComponentResolver,
    Type, provide, Injector, ReflectiveInjector
} from '@angular/core'

import {SIDEBAR_MODEL_TOKEN}         from './editor.token'

import {
    SidebarService, SidebarModel
} from './sidebar.service'

/**
 * Shows the correct type of sidebar depending on the URL
 */
@Component({
    selector: 'sidebar-loader',
    template: ''
})
export class SidebarLoaderComponent implements OnInit {

    private _prevModel : SidebarModel[] = [];
    
    /**
     * Used for dependency injection
     */ 
    constructor(
        private _sidebarService : SidebarService,
        private _injector: Injector,
        private _selfRef : ViewContainerRef,
        private _resolver : ComponentResolver
    ) {}

    /**
     * Wiring up subscriptions
     */
    ngOnInit() {
        this._sidebarService.sidebarModel.subscribe(t => this.onChangedType(t));
    }

    /**
     * The sidebar service has signaled, that the model to render the sidebar
     * has changed.
     */
    private onChangedType(newModel : SidebarModel[]) {

        // Checks two individual sidebar models for equality deeper then
        // reference equality.
        const modelEqual = (lhs : SidebarModel, rhs : SidebarModel) => {
            return (lhs.type === rhs.type && lhs.param === rhs.param);
        };

        // Are those lists of model identical?
        const identical =
            newModel.length === this._prevModel.length &&
            newModel.every((m,i) => modelEqual(m,this._prevModel[i]));
        
        // Is this really a new sidebar?
        if (!identical) {
            // Then clean up previous components
            this._selfRef.clear();

            // Remember previous parameters
            this._prevModel = newModel;

            // Add a component for each model
            newModel.forEach(model => {                
                // Find out what type to construct
                const componentType = this._sidebarService.getComponentType(model.type);

                // Possibly inject data
                let injector = this._injector;
                if (model.param) {
                    injector = ReflectiveInjector.resolveAndCreate([
                        provide(SIDEBAR_MODEL_TOKEN, {useValue: model.param })
                    ], this._injector);
                }

                // And actually create the component
                this._resolver.resolveComponent(componentType)
                    .then( (fac) => {
                        this._selfRef.createComponent(fac, undefined, injector);
                    });
            });
        }
    }
}
