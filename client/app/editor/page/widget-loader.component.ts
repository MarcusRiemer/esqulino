import{
    Component, Input, OnInit,
    DynamicComponentLoader, Injector,
    ViewContainerRef, ComponentResolver,
    Type
} from '@angular/core'

import {Widget}             from '../../shared/page/widgets/index'

import {WidgetComponent}    from './widgets/widget.component'
import {ParagraphComponent} from './widgets/paragraph.component'
import {HeadingComponent}   from './widgets/heading.component'

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
        private _dcl: DynamicComponentLoader,
        private _injector: Injector,
        private _selfRef : ViewContainerRef,
        private _resolver : ComponentResolver
    ) {
        /**
         * TODO: Allow widgets to somehow register themself.
         */
        this._typeMapping = {
            "paragraph" : ParagraphComponent,
            "heading" : HeadingComponent
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
            
            
            // TODO: Call the correct constructor instead of setting the property afterwards
            this._resolver.resolveComponent(componentType)
                .then( (fac) => {
                    const com = this._selfRef.createComponent(fac, index, this._injector);
                    (<WidgetComponent<Widget>>com.instance).model = widget;
                });
        });
    }
}
