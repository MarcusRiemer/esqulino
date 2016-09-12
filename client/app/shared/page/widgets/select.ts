import {Page, ParameterMapping}          from '../page'
import {Widget, WidgetHost}              from '../hierarchy'
import {QueryReference} from '../value-reference'
import {
    SelectDescription, QueryReferenceDescription
} from '../page.description'

import {
    WidgetBase, WidgetDescription, UserInputWidget
} from './widget-base'

export {
    SelectDescription, ParameterMapping
}

export class Select extends UserInputWidget {
    private _queryRefName : string;

    // The name of the parameter this input provides
    private _outParamName : string;

    // Usually shown above or next to the input
    private _caption : string;

    // Called for every <option> to determine its value 
    private _optionValueExpression : string;
    
    // Called for every <option> to determine its text 
    private _optionTextExpression : string;

    constructor(desc : SelectDescription, parent? : WidgetHost) {
        super("select", "widget", false, parent);
        this._outParamName = desc.outParamName;
        this._caption = desc.caption;
        this._queryRefName = desc.queryRefName;
        this._optionTextExpression = desc.optionTextExpression;
        this._optionValueExpression = desc.optionValueExpression;
    }

    /**
     * This describes a minimal <select> element
     */
    static get emptyDescription() : SelectDescription {
        return ({
            type : "select",
            caption : "Auswahl",
            outParamName : "auswahl"
        })
    }

    /**
     * @return The expression that is called for every <option> to determine its value 
     */
    get optionValueExpression() : string {
        return (this._optionValueExpression);
    }

    /**
     * @param value The expression that is called for every <option> to determine its value 
     */
    set optionValueExpression(value : string) {
        this._optionValueExpression = value;
        this.fireModelChange();
    }

    /**
     * @return The expression that is called for every <option> to determine its text 
     */
    get optionTextExpression() : string {
        return (this._optionTextExpression);
    }

    /**
     * @param value The expression that is called for every <option> to determine its text 
     */
    set optionTextExpression(value : string) {
        this._optionTextExpression = value;
        this.fireModelChange();
    }


    /**
     * @return The variable name that references the table
     */
    get queryReferenceName() {
        return (this._queryRefName);
    }

    /**
     * Sets a new referenced query, clearing the previously used
     * columns as a side effect.
     */
    set queryReferenceName(name : string) {
        this._queryRefName = name;
        this.fireModelChange();
    }

    /**
     * @return A (hopefully) resolveable reference to a query.
     */
    get queryReference() : QueryReference {
        return (this.page.getQueryReferenceByName(this.queryReferenceName));
    }

    /**
     * @return The name of the parameter this input provides
     */
    get outParamName() {
        return ("input." + this._outParamName);
    }

    /**
     * @param value The name of the parameter this input provides. If begins
     *              with the prefix "input.", this prefix will be removed.
     */
    set outParamName(value : string) {
        this._outParamName = value;

        if (this._outParamName.startsWith("input.")) {
            this._outParamName = this._outParamName.substr(6);
        }
    }

    /**
     * @return The caption of this input, usually shown above it.
     */
    get caption() {
        return (this._caption);
    }

    /**
     * @param value The caption of this input, usually shown above it.
     */
    set caption(value : string) {
        this._caption = value;
        this.fireModelChange();
    }
    
    protected toModelImpl() : WidgetDescription {
        const toReturn : SelectDescription = {
            type : "select",
            caption : this._caption,
            outParamName : this._outParamName,
        };

        if (this._queryRefName) {
            toReturn.queryRefName = this._queryRefName;
        }

        if (this._optionTextExpression) {
            toReturn.optionTextExpression = this._optionTextExpression;
        }

        if (this._optionValueExpression) {
            toReturn.optionValueExpression = this._optionValueExpression;
        }
        
        return (toReturn);
    }

}
