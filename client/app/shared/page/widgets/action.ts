import {
    ActionDescription, QueryActionDescription, ParameterMappingDescription
} from '../page.description'
import {
    Page, QueryReference, ParameterMapping}
from '../page'

import {Widget}                           from './widget'

export {
    QueryActionDescription
}

/**
 * Any kind of action that should be carried out on the server.
 */
export abstract class Action {
    private _widget : Widget;

    constructor(widget : Widget) {
        this._widget = widget;
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
        super(widget);
        this._queryName = desc.queryName;
    }

    /**
     * @return True, if the query reference could be retrieved.
     */
    get hasValidQueryReference() {
        return (this.page.usesQueryReferenceByName(this.queryName));
    }

    /**
     * @return The "raw" parameters of the referenced quer.
     */
    get queryParameters() {
        return (this.queryReference.query.parameters);
    }

    /**
     * @return The mappings to the required query parameters that are
     *         currently in place.
     */
    get mappings() {
        return (this.queryReference.mapping);
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
            const ref = this.queryReference;

            // Empty the original mappings
            ref.mapping.length = 0;

            // And set new ones according to the current query
            
            this.queryReference.query.parameters.forEach(p => {
                this.queryReference.mapping.push(new ParameterMapping(this.page, {
                    parameterName: p.key,
                    providingName : undefined
                }));
            });

            console.log(`Assigned default mappings, now ${this.mappings.length}`)
        }
    }

    toModel() : QueryActionDescription {
        return ({
            type : "query",
            queryName : this._queryName
        });
    }
}
