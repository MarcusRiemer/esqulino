import{
    Component, Input, OnInit,
    DynamicComponentLoader, Injector,
    ViewContainerRef, ComponentResolver,
    Type
} from '@angular/core'


import {SidebarService}      from './sidebar.service'

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
        this._sidebarService.sidebarType.subscribe(t => this.onChangedType(t));
        
    }

    private onChangedType(newType : string) {
        this._selfRef.clear();

        if (newType) {
            const componentType = this._sidebarService.getComponentType(newType);
            this._resolver.resolveComponent(componentType)
                .then( (fac) => this._selfRef.createComponent(fac, undefined, this._injector));
        }
    }

    get sidebarType() {
        return (this._sidebarService.sidebarType);
    }
}
