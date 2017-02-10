import {Page}                            from '../page'
import {InputDescription}                from '../page.description'
import {Widget, WidgetHost}              from '../hierarchy'

import {StringParameter}                 from './parameters'

import {
    WidgetBase, WidgetDescription, UserInputWidget
} from './widget-base'

export {InputDescription}

/**
 * Asks for input from the user
 */
export class Input extends UserInputWidget {

    // The name of the parameter this input provides
    private _outParamName : string

    // The initial value of this input
    private _initialValue : string

    // Usually shown above or next to the input
    private _caption : string;

    // Usually shown below the label
    private _description : string;

    // The HTML `type` of this input
    private _inputType : string;

    // Is it mandatory to fill out this field?
    private _required : boolean;
    
    constructor(desc : InputDescription, parent? : WidgetHost) {
        super({
            type: "input",
            category: "widget",
            isEmpty: true,
            parameters: [
                new StringParameter({
                    name: "name",
                    getter: () => this._outParamName,
                    setter: (v) => this._outParamName = v
                }),
                new StringParameter({
                    name: "value",
                    getter: () => this._initialValue,
                    setter: (v) => this._initialValue = v
                })
            ]
        }, parent);
        this._outParamName = desc.outParamName;
        this._caption = desc.caption;
        this._description = desc.description;
        this._inputType = desc.inputType;
        this._required = !!desc.required;
        this._initialValue = "";
    }

    /**
     * This describes a "minimal" input paramater
     */
    static get emptyDescription() : InputDescription {
        return ({
            type : "input",
            inputType : "text",
            caption: "Neue Eingabe",
            description : "Beschreibung der neuen Eingabe",
            outParamName : "Neue_Eingabe"
        });
    }

    /**
     * @return The name of the parameter this input provides
     */
    get outParamName() {
        return (this._outParamName);
    }

    /**
     * @param value The name of the parameter this input provides. If begins
     *              with the prefix "input.", this prefix will be removed.
     */
    set outParamName(value : string) {
        this._outParamName = value;
    }

    get initialValue() {
        return (this._initialValue);
    }

    set initialValue(val : string) {
        this._initialValue = val;
        this.fireModelChange();
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

    /**
     * @return The description of this input, usually shown below it.
     */
    get description() {
        return (this._description);
    }

    /**
     * @param value The caption of this input, usually shown below it.
     */
    set description(value : string) {
        this._description = value;
        this.fireModelChange();
    }

    /**
     * @return The HTML `type` of this input
     */
    get inputType() {
        return (this._inputType);
    }

    /**
     * @param value The HTML `type` of this input
     */
    set inputType(value : string) {
        this._inputType = value;
        this.fireModelChange();
    }

    /**
     * @return True, if this input is mandatory.
     */
    get required() : boolean {
        return (this._required);
    }

    /**
     * @param value True, if this input is mandatory.
     */
    set required(value : boolean) {
        this._required = value;
        this.fireModelChange();
    }

    protected toModelImpl() : WidgetDescription {
        const toReturn : InputDescription = {
            type : "input",
            outParamName : this._outParamName,
            caption : this._caption,
            description : this._description,
            inputType : this._inputType
        }

        // Omit the required field if it isn't set.
        if (this._required) {
            toReturn.required = true;
        }

        return (toReturn);
    }
}
