import {
    Component, Input, OnInit,
    Injector,
    ViewContainerRef, ComponentResolver,
    Type, provide, ReflectiveInjector
} from '@angular/core'

import {Widget}                from '../../shared/page/widgets/index'

import {SidebarService}        from '../sidebar.service'

import {WIDGET_MODEL_TOKEN}    from '../sidebar.token'

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
     * The type to load
     */
    @Input() widgets : Widget[];

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

            // Inject the widget model            
            let injector = ReflectiveInjector.resolveAndCreate([
                provide(WIDGET_MODEL_TOKEN, {useValue : widget})
            ],this._injector);

            if (!injector.get(WIDGET_MODEL_TOKEN)) {
                console.log("Couldn't get back widget model")
            }

            if (!injector.get(SidebarService)) {
                console.log("Couldn't get back sidebar service")
            }
            
            // TODO: Call the correct constructor instead of setting the property afterwards
            this._resolver.resolveComponent(componentType)
                .then( (fac) => {
                    this._selfRef.createComponent(fac, index, injector);
                });
        });
    }
}
