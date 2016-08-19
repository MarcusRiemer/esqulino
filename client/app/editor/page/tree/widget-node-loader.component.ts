import {
    Component, Input, OnInit,
    Injector, DynamicComponentLoader,
    ViewChild, ViewContainerRef, ComponentFactoryResolver,
    Type, provide, ReflectiveInjector
} from '@angular/core'

import {WidgetBase}                       from '../../../shared/page/widgets/index'

import {WIDGET_MODEL_TOKEN}               from '../../editor.token'

import {WidgetNodeComponent}              from './widget-node.component'

import * as Tree                          from './widgets/index'

/**
 * Loads the editor-representation of widgets.
 */
@Component({
    template: `<div *ngIf="isLoading">
                 <span class="fa fa-spinner fa-spin"></span> Loading ...
               </div>
               <div #root>
               </div>`,
    selector : "esqulino-node-widget-loader"
})
export class WidgetNodeLoaderComponent implements OnInit {
    /**
     * The widget that requires an editor representation.
     */
    @Input() model : WidgetBase;

    @ViewChild('root', { read: ViewContainerRef}) viewRoot : ViewContainerRef;

    // TODO: This should map to an instance of ConcreteType, but I can't
    //       find out where what would come from.
    private _typeMapping : { [typeName:string] : any} = {}

    private _isLoading = true;

    constructor(
        private _injector: Injector,
        private _selfRef : ViewContainerRef,
        private _resolver : ComponentFactoryResolver,
        private _dcl : DynamicComponentLoader
    ) {
        /**
         * TODO: Allow widgets to somehow register themself.
         */
        this._typeMapping = {
            "heading": Tree.HeadingComponent,
            "query-table": Tree.QueryTableComponent,
            "input": Tree.InputComponent,
        };
    }

    /**
     * Resolves the string description of the widget to load to the most specialised
     * component type. If there is no specific component type availabe a generic
     * fallback is chosen.
     */
    private getComponentType(widgetType : string) : any {
        if (!this._typeMapping[widgetType]) {
            return (WidgetNodeComponent);
        } else {
            return (this._typeMapping[widgetType]);
        }
    }



    /**
     * Dynamically loads the required components.
     */
    ngOnInit() {        
        console.log(`Resolving tree widget type "${this.model.type}"`);
        const componentType = this.getComponentType(this.model.type);
        
        // Inject the widget model            
        let injector = ReflectiveInjector.resolveAndCreate([
            provide(WIDGET_MODEL_TOKEN, {useValue : this.model})
        ],this._injector);
        
        const fac = this._resolver.resolveComponentFactory(componentType)
        this.viewRoot.createComponent(fac, 0, injector);
        this._isLoading = false;
    }
}
