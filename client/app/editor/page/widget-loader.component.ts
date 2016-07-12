import {
    Component, Input, OnInit,
    Injector,
    ViewContainerRef, ComponentResolver,
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
    template: '',
    selector : "esqulino-widget-loader"
})
export class WidgetLoaderComponent implements OnInit {
    /**
     * The widgets that require an editor representation.
     */
    @Input() widgets : Widget[];

    /**
     * The page all these widgets are placed on.
     */
    @Input() page : Page;

    private _typeMapping : { [typeName:string] : Type} = {}

    constructor(
        private _injector: Injector,
        private _selfRef : ViewContainerRef,
        private _resolver : ComponentResolver
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
        if (this.widgets.length) {
            console.log(`Loading ${this.widgets.length} widgets`);
        }
        
        this.widgets.forEach( (widget, index) => {
            console.log(`Resolving widget type "${widget.type}"`);
            const componentType = this.getComponentType(widget.type);

            if (!this.page) {
                throw new Error("WidgetLoaderComponent doesn't have a page");
            }
            
            // Inject the widget model            
            let injector = ReflectiveInjector.resolveAndCreate([
                provide(WIDGET_MODEL_TOKEN, {useValue : widget}),
                provide(Page, {useValue : this.page})
            ],this._injector);
            
            // And create the component
            this._resolver.resolveComponent(componentType)
                .then( (fac) => {
                    this._selfRef.createComponent(fac, index, injector);
                });
        });
    }
}
