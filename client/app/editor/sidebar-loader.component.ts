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

    private _prevType : string;
    private _prevParam : any;
    
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
    private onChangedType(newModel : SidebarModel) {
        // Is this really a new sidebar?
        if (newModel && (newModel.type !== this._prevType || newModel.param !== this._prevParam)) {
            console.log(`Got new model, now got ${this._selfRef.length}`);

            // Clean up previous components
            this._selfRef.clear();

            // Remember previous parameters
            this._prevType = newModel.type;
            this._prevParam = newModel.param;
            
            // Find out what type to construct
            const componentType = this._sidebarService.getComponentType(newModel.type);

            // Possibly inject data
            let injector = this._injector;
            if (newModel.param) {
                injector = ReflectiveInjector.resolveAndCreate([
                    provide(SIDEBAR_MODEL_TOKEN, {useValue: newModel.param })
                ], this._injector);
            }
            
            this._resolver.resolveComponent(componentType)
                .then( (fac) => {
                    this._selfRef.createComponent(fac, undefined, injector);
                });
        }
    }
}
