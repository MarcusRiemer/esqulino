import{
    Component, Input, OnInit,
    DynamicComponentLoader, Injector,
    ViewContainerRef, ComponentResolver,
    Type
} from '@angular/core'

import {Widget}             from '../../shared/page/widgets/index'

import {WidgetComponent}    from './widgets/widget.component'
import {ParagraphComponent} from './widgets/paragraph.component'

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

    private _typeMapping : { [typeName:string] : Type} = {
        "paragraph" : ParagraphComponent
    };

    constructor(
        private _dcl: DynamicComponentLoader,
        private _injector: Injector,
        private _selfRef : ViewContainerRef,
        private _resolver : ComponentResolver
    ) {

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

    public ngOnInit() {
        console.log("WidgetLoaderComponent.ngOnInit()");
        console.log(this);

        this.widgets.forEach( (widget, index) => {
            const componentType = this.getComponentType(widget.type);
            this._resolver.resolveComponent(componentType)
                .then( (fac) => this._selfRef.createComponent(fac, index, this._injector))
                .then( (com) => (<WidgetComponent<Widget>>com.instance).model = widget);
        });
    }
}
