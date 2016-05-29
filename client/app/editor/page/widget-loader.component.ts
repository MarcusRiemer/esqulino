import{
    Component, Input, OnInit,
    DynamicComponentLoader, Injector,
    ViewContainerRef, ComponentResolver,
    Type
} from '@angular/core'

import {ParagraphComponent} from './widgets/paragraph.component'

@Component({
    template: '',
    selector : "esqulino-widget-loader"
})
export class WidgetLoaderComponent implements OnInit {
    @Input() widgetType : Type;

    constructor(
        private _dcl: DynamicComponentLoader,
        private _injector: Injector,
        private _selfRef : ViewContainerRef,
        private _resolver : ComponentResolver
    ) {
        this.widgetType = ParagraphComponent;
    }

    public ngOnInit() {
        console.log("WidgetLoaderComponent.ngOnInit()");

        this._resolver.resolveComponent(this.widgetType)
            .then( (fac) => this._selfRef.createComponent(fac, 0, this._injector));
    }
}
