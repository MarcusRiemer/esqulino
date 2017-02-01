import{
    Component, Input, OnInit,
    ViewContainerRef, ComponentFactoryResolver,
    Type,Injector, ReflectiveInjector
} from '@angular/core'

import {
    SIDEBAR_MODEL_TOKEN, SIDEBAR_ID_TOKEN
} from './editor.token'

import {
    SidebarService, InternalSidebarModel
} from './sidebar.service'

/**
 * Shows the correct type of sidebar depending on the URL
 */
@Component({
    selector: 'sidebar-loader',
    template: ''
})
export class SidebarLoaderComponent implements OnInit {

    private _prevModel : InternalSidebarModel[] = [];

    /**
     * Used for dependency injection
     */
    constructor(
        private _sidebarService : SidebarService,
        private _injector: Injector,
        private _selfRef : ViewContainerRef,
        private _resolver : ComponentFactoryResolver
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
    private onChangedType(newModel : InternalSidebarModel[]) {

        // Checks two individual sidebar models for equality deeper then
        // reference equality.
        const modelEqual = (lhs : InternalSidebarModel,
                            rhs : InternalSidebarModel) => {
            return (lhs.id == rhs.id);
        };

        // Are those lists of model identical?
        const identical =
            newModel.length === this._prevModel.length &&
            newModel.every((m,i) => modelEqual(m,this._prevModel[i]));

        console.log(`Rendering new Sidebars: identical = ${identical}, types = [${newModel.map(s => s.type + " (param: " + s.param + ")" ).join(', ')}]`);

        // Is this really a new sidebar?
        if (!identical) {
            // Then clean up previous components
            this._selfRef.clear();

            console.log(`Number of sidebar items after clearing: ${this._selfRef.length}`);

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
                        { provide : SIDEBAR_MODEL_TOKEN, useValue: model.param },
                        { provide : SIDEBAR_ID_TOKEN, useValue: model.id}
                    ], this._injector);
                }

                // And actually create the component
                const fac = this._resolver.resolveComponentFactory(componentType);
                this._selfRef.createComponent(fac, undefined, injector);
            });
        }
    }
}