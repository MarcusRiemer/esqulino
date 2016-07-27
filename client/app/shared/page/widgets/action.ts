import {
    ActionDescription, QueryActionDescription, ParameterMappingDescription
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

    private _action : Action;

    constructor(action : Action, desc : ParameterMappingDescription) {
        this._action = action;
        
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
     * @return True, if this mapping is fulfilled by the page it is assigned to.
     */
    get isSatisfied() : boolean {
        return (this._inputName && this._action.page.hasUserInput(this._inputName));
    }

    /**
     * @return The name of the wired output
     */
    get outputName() {
        return (this._outputName);
    }

    /**
     * @return The name of the wired input
     */
    get inputName() {
        return (this._inputName);
    }

    toModel() : ParameterMappingDescription {
        return ({
            inputName : this._inputName,
            outputName : this._outputName
        });
    }
}

/**
 * Any kind of action that should be carried out on the server.
 */
export abstract class Action {
    private _widget : Widget;

    private _mappings : ParameterMapping[];

    constructor(widget : Widget, desc : ActionDescription) {
        this._widget = widget;

        // Load mappings, if they are given
        this._mappings = [];
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
     * @return The HTTP method that should be used with this action.
     */
    get method() {
        return ("POST");
    }

    /**
     * @return The server-side URL to call.
     */
    get url() : string {
        throw new Error("This should be abstract, waiting for TS2 which allows abstract properties");
    }

    /**
     * @return The mappings that are used in this action.
     */
    get mappings() : ParameterMapping[] {
        return (this._mappings);
    }

    /**
     * @param value The mappings that are used in this action.
     */
    set mappings(value : ParameterMapping[]) {
        this._mappings = value;
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
export class QueryAction extends Action {
    private _queryName : string;

    constructor(widget : Widget, desc : QueryActionDescription) {
        super(widget, desc);
        this._queryName = desc.queryName;
    }

    /**
     * @return True, if the query reference could be retrieved.
     */
    get hasValidQueryReference() {
        return (this.page.usesQueryReferenceByName(this.queryName));
    }

    /**
     * 
     */
    get queryParameters() {
        return (this.queryReference.query.parameters);
    }

    /**
     * @return The reference this action would kick off.
     */
    get queryReference() : QueryReference {
        if (!this.hasValidQueryReference) {
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
     * @return The server-side URL to call.
     */
    get url() {
        const pageName = this.page.name;
        return (`/${pageName}/query/${this.queryName}`);
    }

    /**
     * @param value The name of the query to run.
     */
    set queryName(value : string) {
        this._queryName = value;
        this.ensureDefaultMappings();
    }

    /**
     * If there are no current mappings, take the referenced
     * thing and create mappings for all of its input.
     */
    ensureDefaultMappings() {
        if (this.hasValidQueryReference && this.mappings.length == 0) {
            const query = this.queryReference.query;
            this.mappings = query.parameters.map(p => {
                return new ParameterMapping(this, {
                    inputName : p.key,
                    outputName : undefined
                });
            });

            console.log(`Assigned default mappings, now ${this.mappings.length}`)
        }
    }

    toModel() : QueryActionDescription {
        return ({
            type : "query",
            mapping : this.mappings.map(m => m.toModel()),
            queryName : this._queryName
        });
    }
}
