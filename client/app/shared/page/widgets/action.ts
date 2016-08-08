import {
    ActionDescription, QueryActionDescription, NavigateActionDescription,
    ParameterMappingDescription
} from '../page.description'
import {
    Page, QueryReference, ParameterMapping}
from '../page'

import {WidgetBase}                           from './widget-base'

export {
    QueryActionDescription, NavigateActionDescription
}

/**
 * Any kind of action that should be carried out on the server.
 */
export abstract class Action {
    private _widget : WidgetBase;

    constructor(widget : WidgetBase) {
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
 * Takes the user to a different page.
 */
export class NavigateAction extends Action {
    private _internal : {
        pageId : string
        pageParams : ParameterMapping[]
    }

    private _external : string;

    constructor(desc : NavigateActionDescription, widget : WidgetBase) {
        super(widget);

        // Making sure the model is valid
        if (desc.external && desc.internal) {
            throw new Error("internal and external are set!");
        }

        if (desc.external) {
            this._external = desc.external;
        } else if (desc.internal) {
            this._internal = {
                pageId : desc.internal.pageId,
                pageParams : desc.internal.parameters.map(p => new ParameterMapping(widget.page, p))
            }
        }
    }

    /**
     * Ensures that this action has a single target it would navigate to.
     */
    private assertSingleTarget() : void {
        if (this.isInternal && this.isExternal) {
            throw new Error(`NavigateAction has internal and external target set`);
        }
    }

    /**
     * Ensures this action has an internal target it would navigate to.
     */
    private assertInternalTarget() : void {
        if (!this.isInternal) {
            throw new Error("This is not an internal navigation action!");
        }
    }

    get method() {
        return ("GET");
    }

    /**
     * @return True, if this navigates to an internal page.
     */
    get isInternal() : boolean {
        return (!!this._internal);
    }

    /**
     * @return True, if this navigates to an external page.
     */
    get isExternal() : boolean {
        return (!!this._external);
    }

    /**
     * @return The URL to navigate to
     */
    get externalUrl() {
        return (this._external);
    }

    /**
     * Changes the external URL this action would navigate to. If an
     * internal action is set, it will be discarded.
     * @param value The URL to navigate to.
     */
    set externalUrl(value : string) {
        this._external = value;
        this._internal = undefined;
    }

    /**
     * @return True, if the internal page is resolveable.
     */
    get isInternalPageResolveable() {
        this.assertInternalTarget();

        return (this.page.project.hasPageById(this._internal.pageId));
    }

    /**
     * @return The id of the internal page this action references, `undefined` if it is
     *         not an internal action.
     */
    get internalPageId() {
        if (this.isInternal) {
            return (this._internal.pageId);
        } else {
            return (undefined);
        }
    }

    /**
     * @return The id of the internal page this action references.
     */
    set internalPageId(value : string) {
        this._internal = {
            pageId : value,
            pageParams : []
        }

        this._external = undefined;
    }

    /**
     * @return The internal page this action would navigate to.
     */
    get internalTargetPage() : Page {
        this.assertInternalTarget();
        return (this.page.project.getPageById(this._internal.pageId));
    }

    /**
     * @return The parameters that would be passed to the internal page.
     */
    get internalParameters() : ParameterMapping[] {
        this.assertInternalTarget();

        return (this._internal.pageParams);
    }

    toModel() : NavigateActionDescription {
        this.assertSingleTarget();
        
        const toReturn : NavigateActionDescription = {
            type : "navigate"
        }

        if (this.isInternal) {
            toReturn.internal = {
                pageId : this._internal.pageId,
                parameters : this._internal.pageParams.map(p => p.toModel())
            }
        }

        if (this.isExternal) {
            toReturn.external = this._external;
        }
        
        return (toReturn);
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

    constructor(widget : WidgetBase, desc : QueryActionDescription) {
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
