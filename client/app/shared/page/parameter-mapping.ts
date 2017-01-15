import {Page}                                         from './page'
import {ParameterMappingDescription}                  from './page.description'

export {ParameterMappingDescription}

/**
 * This class bridges the fact that the page uses a namespaced data model
 * while the queries do not. This class maps variables with prefixes like 
 * "input" or "get" (these are used on the page) to the unprefixed queries.
 *
 * As everything that is named a "parameter" does also act as a "value provider"
 * for its receiving site the nomenclature is a bit difficult to come by.
 */
export class ParameterMapping {
    private _paramName : string;

    private _providingName : string;

    private _page : Page;

    constructor(page : Page, desc : ParameterMappingDescription) {
        this._page = page;
        
        this._paramName = desc.parameterName;
        this._providingName = desc.providingName;
    }

    /**
     * @return True, if this mapping is fulfilled by the page it is assigned to.
     */
    get isSatisfied() : boolean {
        return (this._paramName && this._page.hasParameterProvider(this._providingName));
    }

    /**
     * @return The name of the thing that provides the value to the required value.
     */
    get providingName() {
        return (this._providingName);
    }

    /**
     * @param value The name of the thing that provides the value to the required value.
     */
    set providingName(value : string) {
        this._providingName = value;
    }

    /**
     * @return The name of the wired parameter
     */
    get parameterName() {
        return (this._paramName);
    }

    /**
     * @param value The name of the wired parameter
     */
    set parameterName(value : string) {
        this._paramName = value;
    }

    /**
     * A not so nice leaky abstraction: The UI wants to display an icon for the
     * providing side of the mapping in various places.
     *
     * @return A font-awesome iconclass for the 
     */
    get providingIconClass() {
        if (!this.providingName || this.providingName.length == 0) {
            // There is no provider set
            return ("fa-sign-in");
        } else if (!this.isSatisfied) {
            // A provider is set, but it doesn't actually provide anything
            return ("fa-warning");
        } else if (this.providingName.startsWith("input.")) {
            // Provider is an input element
            return ("fa-keyboard-o");
        } else if (this.providingName.startsWith("get.")) {
            // Provider is a request parameter
            return ("fa-link");
        } else {
            // Neutral icon: Provider still needed
            return ("fa-sign-in");
        }
    }

    toModel() : ParameterMappingDescription {
        return ({
            parameterName : this._paramName,
            providingName : this._providingName
        });
    }
}
