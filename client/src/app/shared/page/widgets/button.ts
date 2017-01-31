import {Page, ParameterMapping}          from '../page'
import {Widget, WidgetHost}              from '../hierarchy'
import {
    ButtonDescription, QueryReferenceDescription
} from '../page.description'

import {
    WidgetBase, WidgetDescription, ParametrizedWidget
} from './widget-base'

import {
    QueryReference, QueryAction, NavigateAction
} from './action'

export {
    ButtonDescription, ParameterMapping
}

/**
 * A button the user can press.
 */
export class Button extends ParametrizedWidget {
    private _queryAction : QueryAction;

    private _navigateAction : NavigateAction;

    private _text : string;

    constructor(desc : ButtonDescription, parent? : WidgetHost) {
        super({ type : "button", category: "widget", isEmpty: false}, parent);
        this._text = desc.text;
        this._queryAction = new QueryAction(this, desc.query);
        this._navigateAction = new NavigateAction(this, desc.navigate);
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
        return (this._queryAction.hasValidTarget);
    }
    
    /**
     * @return A possibly targeted query.
     */
    get queryReference() : QueryReference {
        return (this._queryAction.queryReference );
    }

    get navigateAction() : NavigateAction {
        return (this._navigateAction);
    }

    /**
     * @param value The target URL
     */
    set queryReference(value) {
        this._queryAction.queryReference = value;
        this.fireModelChange();
    }

    setNewQueryId(value : string) {
        this._queryAction.queryReference.queryId = value;
        this.fireModelChange();
    }

    /**
     * @return The parameters that are required to run the action
     *         behind this button.
     */
    get mapping() {
        if (this._queryAction.hasValidTarget) {
            return (this.queryReference.mapping);
        } else {
            return ([]);
        }
    }

    /**
     * @param newParams The parameters that are required to run the action
     *                  behind this button.      
     */
    set mapping(newParams : ParameterMapping[]) {
        this._queryAction.queryReference.mapping = newParams;
        this.fireModelChange();
    }
    
    protected toModelImpl() : WidgetDescription {
        const toReturn : ButtonDescription = {
            type : "button",
            text : this._text
        };

        // Only add the query reference if it adds more then it's typename
        const queryRefDesc = this.queryReference.toModel();
        if (Object.keys(queryRefDesc).length > 1) {
            toReturn.query = queryRefDesc;
        }

        // Only add navigation actions if they have been added by the user
        if (this._navigateAction.hasValidTarget) {
            toReturn.navigate = this._navigateAction.toModel();
        }

        return (toReturn);
    }
    
}
