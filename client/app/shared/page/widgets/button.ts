import {Page, ParameterMapping}          from '../page'
import {Widget, WidgetHost}              from '../hierarchy'
import {
    ButtonDescription, QueryActionDescription
} from '../page.description'

import {QueryAction}                     from './action'
import {
    WidgetBase, WidgetDescription, ParametrizedWidget
} from './widget-base'

export {
    ButtonDescription, QueryAction, ParameterMapping
}

/**
 * A button the user can press.
 */
export class Button extends ParametrizedWidget {
    private _action : QueryAction;

    private _text : string;

    constructor(desc : ButtonDescription, parent? : WidgetHost) {
        super("button", "widget", parent);
        this._text = desc.text;

        // If there is an action, hold on to it
        if (desc.action) {
            this._action = new QueryAction(this, desc.action);
        }
    }

    static get emptyDescription() : ButtonDescription {
        return ({
            type : "button",
            text : "Knopf",
            action : undefined,
            value : undefined
        });
    }
    
    /**
     * @return The target URL
     */
    get text() {
        return (this._text);
    }

    /**
     * @param value The target URL
     */
    set text(value : string) {
        this._text = value;
        this.fireModelChange();
    }

    /**
     * @return True, if there is an action.
     */
    get hasAction() {
        return (!!this._action);
    }
    
    /**
     * @return The target URL
     */
    get action() {
        return (this._action);
    }

    /**
     * @param value The target URL
     */
    set action(value) {
        this._action = value;
        this.fireModelChange();
    }

    /**
     * @return The parameters that are required to run the action
     *         behind this button.
     */
    getParameters() {
        if (this._action) {
            return (this._action.mappings);
        } else {
            return ([]);
        }
    }
    
    protected toModelImpl() : WidgetDescription {
        let action : QueryActionDescription = undefined;
        if (this._action) {
            action = this._action.toModel();
        }
        
        return ({
            type : "button",
            text : this._text,
            action : action
        } as ButtonDescription);
    }
    
}
