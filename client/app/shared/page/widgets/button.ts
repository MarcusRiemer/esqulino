import {Widget, WidgetDescription} from './widget'
import {ButtonDescription}         from '../page.description'

export {ButtonDescription}

export class Button extends Widget {
    private _value : string;

    private _action : string;

    private _text : string;

    constructor(desc : ButtonDescription) {
        super("button");

        this._text = desc.text;
        this._value = desc.value;
        this._action = desc.action;
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
    set action(value : string) {
        this._action = value;
    }

    /**
     * @return This value allows the server to distinguish the action
     *         the user has chosen.
     */
    get value() {
        return (this._value);
    }

    /**
     * @param value This allows the server to distinguish the action
     *              the user has chosen.
     */
    set value(value : string) {
        this._value = value;
    }     

    protected toModelImpl() : WidgetDescription {
        return ({
            type : "button",
            text : this._text,
            action : this._action,
            value : this._value
        } as ButtonDescription);
    }
    
}
