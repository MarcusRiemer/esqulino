import {
    Component, Input, OnInit, OnChanges, SimpleChanges,
    Injector, ComponentRef,
    ViewChild, ViewContainerRef, ComponentFactoryResolver,
    Type, ReflectiveInjector
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
export class WidgetNodeLoaderComponent implements OnChanges {
    /**
     * The widget that requires an editor representation.
     */
    @Input() model : WidgetBase;

    @ViewChild('root', { read: ViewContainerRef}) viewRoot : ViewContainerRef;

    // TODO: This should map to an instance of ConcreteType, but I can't
    //       find out where what would come from.
    private _typeMapping : { [typeName:string] : any} = {}

    private _isLoading = true;

    private _childRef : ComponentRef<{}> = undefined;

    constructor(
        private _injector: Injector,
        private _selfRef : ViewContainerRef,
        private _resolver : ComponentFactoryResolver,
    ) {
        /**
         * TODO: Allow widgets to somehow register themself.
         */
        this._typeMapping = {
            "button": Tree.ButtonComponent,
            "heading": Tree.HeadingComponent,
            "query-table": Tree.QueryTableComponent,
            "input": Tree.InputComponent,
            "link": Tree.LinkComponent,
            "embedded-html": Tree.EmbeddedHtmlComponent,
            "select": Tree.SelectComponent,
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
     * Some binding has changed.
     */
    ngOnChanges(changes: SimpleChanges) {
        if ("model" in changes) {
            this.refreshChildComponent();
        }
    }

    /**
     * Dynamically loads the required component.
     */
    refreshChildComponent() {
        if (this._childRef) {
            this._childRef.destroy();
        }
        
        console.log(`Resolving tree widget type "${this.model.type}"`);
        const componentType = this.getComponentType(this.model.type);
        
        // Inject the widget model            
        let injector = ReflectiveInjector.resolveAndCreate([
            {provide: WIDGET_MODEL_TOKEN, useValue : this.model}
        ],this._injector);
        
        const fac = this._resolver.resolveComponentFactory(componentType)
        this._childRef = this.viewRoot.createComponent(fac, 0, injector);
        this._isLoading = false;
    }
}
