import {
    ActionDescription, NavigateActionDescription,
    ParameterMappingDescription
} from '../page.description'
import {
    Page, ParameterMapping,
} from '../page'
import {
    QueryReference, QueryReferenceDescription,
} from '../value-reference'
import {
    encodeUriParameters, KeyValuePairs
} from '../../../shared/util'

import {Widget}                           from '../hierarchy'

export {
    NavigateActionDescription, QueryReference
}

/**
 * Any kind of action that could be associated with a form. Deriving actions should be
 * instanciable with undefined descriptions, in that case they should fall back
 * to sensible default. This allows the UI layer to rely on the existance of actions
 * whereever they appear.
 */
export abstract class Action {
    private _widget : Widget;

    constructor(widget : Widget) {
        this._widget = widget;
    }

    /**
     * @return The widget that is associated with this action.
     */
    get widget() {
        return (this._widget);
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
    abstract get method() : string;

    /**
     * @return True, if this action has a valid target associated.
     */
    abstract get hasValidTarget() : boolean;

    /**
     * @return The server-side URL to call.
     */
    abstract get targetUrl() : string;
}

/**
 * Executes a (probably mutating) query on the server.
 */
export class QueryAction extends Action {

    private _queryRef : QueryReference;
    
    constructor(widget : Widget, queryRefDesc : QueryReferenceDescription) {
        super(widget);

        if (queryRefDesc) {
            this._queryRef = new QueryReference(this.page, queryRefDesc);
        } else {
            this._queryRef = new QueryReference(this.page, {
                type : "query"
            });
        }
    }

    /**
     * Mutating actions are currently always POST-requests.
     *
     * @todo Make use of better fitting HTTP-verbs
     */
    get method() {
        return ("POST");
    }

    /**
     * @return The query that would be executed by this action.
     */
    get queryReference() : QueryReference {
        return (this._queryRef);
    }

    /**
     * @param value The query that would be executed by this action.
     */
    set queryReference(value : QueryReference) {
        this.queryReference = value;
    }

    /**
     * @return True, if the current target is a resolveable query.
     */
    get hasValidTarget() {
        return (this._queryRef.isResolveable);
    }

    /**
     * Generates a fully mapped URL for this action. Simply calling this
     * URL in a <form>-environment that provides matching inputs is
     * enough to actually run the query on the server.
     */
    get targetUrl() {
        if (this._queryRef && this._queryRef.isResolveable) {
            const pageName = this.page.name;
            const queryId = this._queryRef.query.id;
            const mappingParams = encodeUriParameters(this._queryRef.keyValueMapping);

            return (`/${pageName}/query/${queryId}?${mappingParams}`);
        } else {
            return (undefined);
        }
    }
}

/**
 * Takes the user to a different page. Ensures that all parameters
 * for that page are satisfied.
 */
export class NavigateAction extends Action {
    private _internal : {
        pageId : string
        pageParams : ParameterMapping[]
    }

    private _external : string;

    constructor(widget : Widget, desc : NavigateActionDescription) {
        super(widget);

        // Was there any model passed in?
        if (desc) {
            // Making sure the model is valid as a whole
            if (desc.external && desc.internal) {
                throw new Error("internal and external are set!");
            }

            // And load the description of the respective target
            if (desc.external) {
                this._external = desc.external;
            } else if (desc.internal) {
                this._internal = {
                    pageId : desc.internal.pageId,
                    pageParams : desc.internal.parameters.map(p => new ParameterMapping(widget.page, p))
                }
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

    /**
     * @return Navigation always happens via GET-requests.
     */
    get method() {
        return ("GET");
    }

    /**
     * @return True, if this actions has any custom targets assigned.
     */
    get hasAnyTarget() {
        return (this.isExternal || this.isInternal);
    }

    /**
     * @return True, if the current target is either an external page
     *         or a resolveable internal page.
     */
    get hasValidTarget() {
        return (this.isExternal || (this.isInternal && this.isInternalPageResolveable));
    }

    /**
     * Clears all targets that were part of this action.
     */
    clear() {
        this._external = undefined;
        this._internal = undefined;
    }

    /**
     * Provides the URL of the currently specified target. If no target
     * is specified, the returned value defaults to a no-op URL.
     */
    get targetUrl() {
        if (this.isExternal) {
            return (this.externalUrl);
        } else if (this.isInternal) {
            // Encode parameters as "key=value" pairs and join them with a "&"
            let queryString = this.internalParameters
                .map(p => `${p.parameterName}={{${p.providingName}}}`)
                .join("&");

            // If there were any parameters prepend the `?` to mark the beginning
            // of the query part of the URL
            if (queryString.length > 0) {
                queryString = "?" + queryString;
            }

            // We currently link to pages, not internal IDs
            const pageName = this.internalTargetPage.name;
            return (`/${pageName}${queryString}`);
        } else {
            return ("#");
        }
    }

    get friendlyTargetName() {
        if (this.isInternal && this.isInternalPageResolveable) {
            return (this.internalTargetPage.name);
        } else if (this.isExternal) {
            try {
                const url = new URL(this.externalUrl);
                return (url.host);
            } catch (e) {
                return (this.externalUrl);
            }
        } else {
            return "ERROR: No target";
        }
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

        this.widget.page.markSaveRequired();
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

        this.widget.page.markSaveRequired();
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
