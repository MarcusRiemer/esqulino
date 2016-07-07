import{
    Component, Input, OnInit,
    DynamicComponentLoader, Injector,
    ViewContainerRef, ComponentResolver,
    Type, provide, ReflectiveInjector
} from '@angular/core'

import {SIDEBAR_MODEL_TOKEN}         from './sidebar.token'

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
export class SidebarLoaderComponent {   
    constructor(
        private _sidebarService : SidebarService,
        private _dcl: DynamicComponentLoader,
        private _injector: Injector,
        private _selfRef : ViewContainerRef,
        private _resolver : ComponentResolver
    ) {
        this._sidebarService.sidebarModel.subscribe(t => this.onChangedType(t));
        
    }

    private onChangedType(newModel : SidebarModel) {
        this._selfRef.clear();

        if (newModel) {
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
