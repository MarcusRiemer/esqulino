import {Page}                            from '../page'
import {InputDescription}                from '../page.description'

import {
    Widget, WidgetDescription, UserInputWidget
} from './widget'

export {InputDescription}

/**
 * Asks for input from the user
 */
export class Input extends UserInputWidget {

    // The name of the parameter this input provides
    private _outParamName : string

    // Usually shown above or next to the input
    private _caption : string;

    // Usually shown below the label
    private _description : string;

    // The HTML `type` of this input
    private _inputType : string;
    
    constructor(desc : InputDescription, page? : Page) {
        super("input", page);
        this._outParamName = desc.outParamName;
        this._caption = desc.caption;
        this._description = desc.description;
        this._inputType = desc.inputType;
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
        })
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
    }

    /**
     * @return True, if this input provides the given name.
     */ 
    providesParameter(name : string) {
        return (this.outParamName === name);
    }

    protected toModelImpl() : WidgetDescription {
        const toReturn : InputDescription = {
            type : "input",
            outParamName : this._outParamName,
            caption : this._caption,
            description : this._description,
            inputType : this._inputType
        }

        return (toReturn);
    }
}
