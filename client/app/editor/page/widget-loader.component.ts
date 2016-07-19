import {
    Component, Input, OnInit,
    Injector, DynamicComponentLoader,
    ViewChild, ViewContainerRef, ComponentResolver,
    Type, provide, ReflectiveInjector
} from '@angular/core'

import {Page}                  from '../../shared/page/index'

import {Widget}                from '../../shared/page/widgets/index'

import {SidebarService}        from '../sidebar.service'

import {
    WIDGET_MODEL_TOKEN
} from '../editor.token'

import {WidgetComponent}       from './widgets/widget.component'
import {ParagraphComponent}    from './widgets/paragraph.component'
import {HeadingComponent}      from './widgets/heading.component'
import {QueryTableComponent}   from './widgets/query-table.component'

/**
 * Loads the editor-representation of widgets.
 */
@Component({
    template: `<div *ngIf="isLoading">
                 <span class="fa fa-spinner fa-spin"></span> Loading ...
               </div>
               <div #root>
               </div>`,
    selector : "esqulino-widget-loader"
})
export class WidgetLoaderComponent implements OnInit {
    /**
     * The widget that requires an editor representation.
     */
    @Input() widget : Widget;

    /**
     * The page all these widgets are placed on.
     */
    @Input() page : Page;

    @ViewChild('root', { read: ViewContainerRef}) viewRoot : ViewContainerRef;

    private _typeMapping : { [typeName:string] : Type} = {}

    private _isLoading = true;

    constructor(
        private _injector: Injector,
        private _selfRef : ViewContainerRef,
        private _resolver : ComponentResolver,
        private _dcl : DynamicComponentLoader
    ) {
        /**
         * TODO: Allow widgets to somehow register themself.
         */
        this._typeMapping = {
            "paragraph" : ParagraphComponent,
            "heading" : HeadingComponent,
            "query-table": QueryTableComponent
        };
    }

    get isLoading() {
        return (this._isLoading);
    }

    /**
     * Resolves the string description of the widget to load
     * to the correct component type.
     */
    private getComponentType(widgetType : string) : Type {
        if (!this._typeMapping[widgetType]) {
            throw new Error(`Unknown widget type requested from template: "${widgetType}"`);
        }
        return (this._typeMapping[widgetType]);
    }

    /**
     * Dynamically loads the required components.
     */
    ngOnInit() {        
        console.log(`Resolving widget type "${this.widget.type}"`);
        const componentType = this.getComponentType(this.widget.type);

        if (!this.page) {
            throw new Error("WidgetLoaderComponent doesn't have a page");
        }
        
        // Inject the widget model            
        let injector = ReflectiveInjector.resolveAndCreate([
            provide(WIDGET_MODEL_TOKEN, {useValue : this.widget}),
            provide(Page, {useValue : this.page})
        ],this._injector);
        
        this._resolver.resolveComponent(componentType)
            .then( (fac) => {
                this.viewRoot.createComponent(fac, 0, injector);
                this._isLoading = false;
            });
    }
}
