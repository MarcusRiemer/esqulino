import {WidgetDescription, FormDescription}        from '../page.description'

import {loadWidget}                                from './widget-loader'
import {
    Widget, WidgetHost, WidgetBase, WidgetEditorDescription,
    ParameterMapping
} from './widget-base'

export {FormDescription}

/**
 * Describes a HTML form.
 */
export class Form extends WidgetBase {
    private _action : string;

    private _method : string;

    private _widgets : WidgetBase[];

    constructor(desc : FormDescription, parent? : WidgetHost) {
        super({ type: "form", category: "structural", isEmpty: false}, parent);

        this._widgets = desc.children.map( (wiDesc) => loadWidget(wiDesc, this) );
    }

    /**
     * This describes a "minimal" form
     */
    static get emptyDescription() : FormDescription {
        return ({
            type : "form",
            children : []
        })
    }

    /**
     * @return The widgets for this form.
     */
    get children() {
        return (this._widgets);
    }

    get providedNames() : string[] {
        return (this.children.filter(c => c instanceof UserInputWidget)
                .map((ui : UserInputWidget) => ui.outParamName));
    }

    /**
     * Accepts anything that isn't a form itself.
     */
    acceptsWidget(desc : WidgetDescription) : boolean {
        return (desc.type != this.type);
    }

    protected toModelImpl() : WidgetDescription {
        const toReturn : FormDescription = {
            type : "form",
            children : this._widgets.map(w => w.toModel())
        }

        return (toReturn);
    }
}

/**
 * A widget that provides external input and must be placed on
 * a form.
 */
export abstract class UserInputWidget extends WidgetBase {

    constructor(desc : WidgetEditorDescription,
                parent? : WidgetHost)
    {
        super(desc, parent);
    }

    /**
     * The name of the variable that is provided by this widget.
     */
    abstract get outParamName() : string;

    /**
     * @return True, if this widget provides the required output.
     */
    providesParameter(name : string) : boolean {
        return (name === this.outParamName);
    }
}

/**
 * A widget that needs specific external input to work.
 */
export abstract class ParametrizedWidget extends WidgetBase {

    constructor(desc : WidgetEditorDescription,
                parent? : WidgetHost)
    {
        super(desc, parent);
    }

    /**
     * @return The form that this widget is part of.
     */
    get parentForm() : Form {
        let host = this.parent;
        while(host && host instanceof WidgetBase && !(host instanceof Form)) {
            host = host.parent;
        }

        return (host as Form);
    }

    /**
     * @return All parameters required for this widget
     */
    abstract get mapping() : ParameterMapping[];

    /**
     * @return True, if the given name is required as an input parameter.
     */
    hasInputParameter(name : string) {
        return (this.mapping.some(p => p.parameterName == name));
    }
}
