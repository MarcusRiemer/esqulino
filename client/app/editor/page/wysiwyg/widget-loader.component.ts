import {
    Component, Input, OnInit,
    Injector, DynamicComponentLoader,
    ViewChild, ViewContainerRef, ComponentFactoryResolver,
    Type, provide, ReflectiveInjector
} from '@angular/core'

import {WidgetBase}                      from '../../../shared/page/widgets/index'

import {WIDGET_MODEL_TOKEN}              from '../../editor.token'

import {ButtonComponent}                 from './widgets/button.component'
import {EmbeddedHtmlComponent}           from './widgets/embedded-html.component'
import {ParagraphComponent}              from './widgets/paragraph.component'
import {HeadingComponent}                from './widgets/heading.component'
import {LinkComponent}                   from './widgets/link.component'
import {QueryTableComponent}             from './widgets/query-table.component'
import {InputComponent}                  from './widgets/input.component'

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
    @Input() widget : WidgetBase;

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
            "button": ButtonComponent,
            "embedded-html": EmbeddedHtmlComponent,
            "paragraph": ParagraphComponent,
            "heading": HeadingComponent,
            "link": LinkComponent,
            "query-table": QueryTableComponent,
            "input": InputComponent
        };
    }

    /**
     * @return True, if this loader is currently fetching the component to show.
     */
    get isLoading() {
        return (this._isLoading);
    }

    /**
     * Resolves the string description of the widget to load
     * to the correct component type.
     */
    private getComponentType(widgetType : string) : any {
        if (!this._typeMapping[widgetType]) {
            throw new Error(`Unknown WYSIWYG widget type requested from template: "${widgetType}"`);
        }
        return (this._typeMapping[widgetType]);
    }

    /**
     * Dynamically loads the required components.
     */
    ngOnInit() {        
        console.log(`Resolving WYSIWYG widget type "${this.widget.type}"`);
        const componentType = this.getComponentType(this.widget.type);
        
        // Inject the widget model            
        let injector = ReflectiveInjector.resolveAndCreate([
            provide(WIDGET_MODEL_TOKEN, {useValue : this.widget}),
        ],this._injector);
        
        const fac = this._resolver.resolveComponentFactory(componentType)
        this.viewRoot.createComponent(fac, 0, injector);
        this._isLoading = false;
    }
}
