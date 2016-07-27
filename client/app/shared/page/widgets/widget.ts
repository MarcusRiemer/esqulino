import {Page, WidgetDescription}          from '../page'

import {ParameterMapping}                 from './action'

export {WidgetDescription}

/**
 * The data model of something that can be more or less interactively
 * displayed on a page. All HTML code that is generated by the descendants
 * of this class is meant to be used in the PageEditors UI, **not** in the
 * user-facing page.
 */
export abstract class Widget {

    private _type : string;

    private _page : Page;

    constructor(type : string, page : Page) {
        this._type = type;
        this._page = page;
    }

    /**
     * @return The page this widget is placed on.
     */
    get page() {
        if (!this._page) {
            throw new Error(`Widget of type "${this._type}" has no page`);
        }

        return (this._page);
    }

    /**
     * Used to pick a matching renderer.
     *
     * @return An internal typename for this widget.
     */
    get type() : string {
        return (this._type);
    }

    /**
     * @return A storeable object of this widget.
     */
    toModel() : WidgetDescription {
        // Let the derived classes do its thing
        const extendedInput = this.toModelImpl();

        // Ensure the relevant type-information is available
        if (!extendedInput.type) {
            extendedInput.type = this._type;
        }

        return (extendedInput);
    }

    /**
     * Allows deriving classes to specify serialization.
     */
    protected abstract toModelImpl() : WidgetDescription;
}

/**
 * A widget that needs specific external input to work.
 */
export abstract class ParametrizedWidget extends Widget {

    /**
     * @return All parameters required for this widget
     */
    abstract getParameters() : ParameterMapping[];

    /**
     * @return True, if the given name is required as an input parameter.
     */
    hasInputParameter(name : string) {
        return (this.getParameters().some(p => p.inputName == name));
    }
}

/**
 * A widget that provides external input
 */
export abstract class UserInputWidget extends Widget {

    /**
     * @return True, if this widget provides the required output.
     */
    abstract providesParameter(name : string) : boolean;
}

