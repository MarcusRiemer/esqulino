import {
    QueryActionDescription, ParameterMappingDescription
} from '../page.description'
import {Page, QueryReference}             from '../page'

import {Widget}                           from './widget'

export {
    QueryActionDescription, ParameterMappingDescription
}

/**
 * Inputs and outputs *may* use identical names but are not required
 * to do so.
 */
export class ParameterMapping {
    private _inputName : string;

    private _outputName : string;

    constructor(action : QueryAction, desc : ParameterMappingDescription) {
        this._inputName = desc.inputName;
        this._outputName = desc.outputName;
    }

    /**
     * @return True, if this mapping is not standard and requires a
     *         explicit annotation.
     */
    get isCustom() {
        return (this._inputName && this._outputName &&
                this._inputName === this._outputName);
    }

    /**
     * @return The name of the wired output
     */
    get outputName() {
        return (this._outputName);
    }

    toModel() : ParameterMappingDescription {
        return ({
            inputName : this._inputName,
            outputName : this._outputName
        });
    }
}

/**
 * This action will run a query on the server. This is basically a mapping
 * of input elements on the page to the specific parameters the action
 * will require.
 *
 * If a queries input is mapped to a differently named output, a hidden form
 * field will be rendered onto the page. This form field will write the mapping
 * for the server to look up.
 */
export class QueryAction {
    private _queryName : string;

    private _widget : Widget;

    private _mappings : ParameterMapping[];

    constructor(widget : Widget, desc : QueryActionDescription) {
        this._widget = widget;
        this._queryName = desc.queryName;
        this._mappings = [];

        // Load mappings, if they are given
        if (desc.mapping) {
            desc.mapping.map(p => new ParameterMapping(this, p));
        }
    }

    /**
     * @return The page that sets the context for this action.
     */
    get page() {
        return (this._widget.page);
    }

    /**
     * @return The reference this action would kick off.
     */
    get queryReference() : QueryReference {
        if (!this.page.usesQueryReferenceByName(this.queryName)) {
            throw new Error(`Page does not have a query named "${this.queryName}"`);
        }

        return (this.page.getQueryReferenceByName(this.queryName));
    }

    /**
     * @return The name of the query to run.
     */
    get queryName() {
        return (this._queryName);
    }

    /**
     * @param value The name of the query to run.
     */
    set queryName(value : string) {
        this._queryName = value;
    }

    /**
     * @return The HTTP method that should be used with this action.
     */
    get method() {
        return ("POST");
    }

    toModel() : QueryActionDescription {
        return ({
            mapping : this._mappings.map(m => m.toModel()),
            queryName : this._queryName
        });
    }
}
