import {Page}                            from '../page'
import {Widget, WidgetHost}              from '../hierarchy'
import {
    LinkDescription, ParameterMappingDescription
} from '../page.description'

import {WidgetBase, WidgetDescription}       from './widget-base'
import {NavigateAction}                      from './action'

export {LinkDescription, ParameterMappingDescription, NavigateAction}

export class Link extends WidgetBase {
    private _text : string
    private _action : NavigateAction
    
    constructor(desc : LinkDescription, parent? : WidgetHost) {
        super({ type: "link", category: "widget", isEmpty: false }, parent);

        this._text = desc.text;
        this._action = new NavigateAction(this, desc.action);
    }

    static get emptyDescription() : LinkDescription {
        return ({
            type : "link",
            text : "Link",
            action : {
                type : "navigate"
            }
        })
    }

    /**
     * @return The text this link should display.
     */
    get text() {
        return (this._text);
    }

    /**
     * @param value The text this link should display.
     */
    set text(value : string) {
        this._text = value;
        this.fireModelChange();
    }

    /**
     * @return The action this link performs.
     */
    get action() {
        return (this._action);
    }

    protected toModelImpl() : WidgetDescription {
        const toReturn : LinkDescription = {
            type : "link",
            text : this._text,
            action : this._action.toModel()
        }

        return (toReturn);
    }
}
