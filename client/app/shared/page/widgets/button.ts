import {Page, ParameterMapping}          from '../page'
import {Widget, WidgetHost}              from '../hierarchy'
import {QueryReference} from '../value-reference'
import {
    ButtonDescription, QueryReferenceDescription
} from '../page.description'

import {
    WidgetBase, WidgetDescription, ParametrizedWidget
} from './widget-base'

export {
    ButtonDescription, ParameterMapping
}

/**
 * A button the user can press.
 */
export class Button extends ParametrizedWidget {
    private _ref : QueryReference;

    private _text : string;

    constructor(desc : ButtonDescription, parent? : WidgetHost) {
        super("button", "widget", false, parent);
        this._text = desc.text;

        // If there is an action, hold on to it
        if (desc.query) {
            this._ref = new QueryReference(this.page, desc.query);
        } else {
            this._ref = new QueryReference(this.page, {
                type : "query"
            });
        }
    }

    static get emptyDescription() : ButtonDescription {
        return ({
            type : "button",
            text : "Knopf",
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
        return (!!this._ref);
    }
    
    /**
     * @return A possibly targeted query.
     */
    get queryReference() {
        return (this._ref);
    }

    /**
     * @param value The target URL
     */
    set queryReference(value) {
        this._ref = value;
        this.fireModelChange();
    }

    setNewQueryId(value : string) {
        this._ref.queryId = value;
        this.fireModelChange();
    }

    /**
     * @return The parameters that are required to run the action
     *         behind this button.
     */
    get mapping() {
        if (this._ref) {
            return (this._ref.mapping);
        } else {
            return ([]);
        }
    }

    /**
     * @param newParams The parameters that are required to run the action
     *                  behind this button.      
     */
    set mapping(newParams : ParameterMapping[]) {
        this._ref.mapping = newParams;
        this.fireModelChange();
    }
    
    protected toModelImpl() : WidgetDescription {
        const toReturn : ButtonDescription = {
            type : "button",
            text : this._text
        };

        // Only add the query reference if it adds more then it's typename
        const queryRefDesc = this._ref.toModel();
        if (Object.keys(queryRefDesc).length > 1) {
            toReturn.query = queryRefDesc;
        }

        return (toReturn);
    }
    
}
