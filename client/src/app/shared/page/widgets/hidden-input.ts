import {Page}                            from '../page'
import {HiddenInputDescription}          from '../page.description'
import {Widget, WidgetHost}              from '../hierarchy'

import {
    WidgetBase, WidgetDescription, UserInputWidget
} from './widget-base'

export {HiddenInputDescription}

/**
 * A <input type="hidden">-node. This is in a separate class
 * from the usual input because it is rendered server-side.
 */
export class HiddenInput extends WidgetBase {
    private _outParamName : string;

    constructor(desc : HiddenInputDescription, parent? : WidgetHost) {
        super("hidden", "widget", true, parent);
        this._outParamName = desc.outParamName;
    }

    /**
     * This describes a hidden input field without any assigned
     * value.
     */
    static get emptyDescription() : HiddenInputDescription {
        return ({
            type : "hidden",
            outParamName : ""
        });
    }

    protected toModelImpl() : WidgetDescription {
        return ({
            type : "hidden",
            outParamName : this._outParamName
        } as HiddenInputDescription);
    }
}
