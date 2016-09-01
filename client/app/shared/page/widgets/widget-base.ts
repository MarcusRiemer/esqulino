import {Subject}                                     from 'rxjs/Subject'
import {Observable}                                  from 'rxjs/Observable'

import {ModelObservable}                             from '../../interfaces'

import {Page, WidgetDescription, ParameterMapping}   from '../page'
import {
    Widget, WidgetCategory,
    WidgetHost, isWidgetHost
} from '../hierarchy'

import {loadWidget}                                  from './widget-loader'

export {
    WidgetDescription, ParameterMapping,
    Widget, WidgetHost
}

/**
 * The data model of something that can be more or less interactively
 * displayed on a page. All HTML code that is generated by the descendants
 * of this class is meant to be used in the PageEditors UI, **not** in the
 * user-facing page.
 */
export abstract class WidgetBase implements Widget, ModelObservable<Widget> {
    // The type-identifier of this widget
    private _type : string;

    // The parent of this widget, will usually be another widget but can also
    // be a Page which is at the root of the hierarchy.
    private _parent : WidgetHost;

    // Fired when the internal model has changed
    private _modelChanged = new Subject<Widget>();

    // The category of this widget.
    private _category : WidgetCategory;

    // Is this an empty element?
    private _isEmptyElement : boolean;

    constructor(type : string,
                category : WidgetCategory,
                isEmpty : boolean,
                parent? : WidgetHost)
    {
        this._type = type;
        this._category = category;
        this._parent = parent;
        this._isEmptyElement = isEmpty;
    }

    /**
     * Fired when something about this model has changed.
     */
    get modelChanged() : Observable<Widget> {
        return (this._modelChanged);
    }

    /**
     * @return The page this widget is placed on.
     */
    get page() : Page {
        if (!this._parent) {
            throw new Error(`Widget of type "${this._type}" has no further parent that could be a page`);
        } else {
            return (this._parent.page)
        }
    }

    /**
     * @return The parent of this widget.
     */
    get parent() {
        return (this._parent);
    }

    /**
     * @return The user-oriented category of this widget.
     */
    get category() : WidgetCategory {
        return (this._category);
    }

    /**
     * @return True, if this is an empty element like <img> or <input>.
     */
    get isEmptyElement() : boolean {
        return (this._isEmptyElement);
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
     * Allows implementing classes to signal that their model has changed.
     */
    fireModelChange() {
        this._modelChanged.next(this);
    }

    /**
     * Allows deriving classes to specify serialization.
     */
    protected abstract toModelImpl() : WidgetDescription;
}

/**
 * A widget that may host other widgets.
 */
export abstract class HostingWidget extends WidgetBase implements WidgetHost {

    constructor(type : string,
                category : WidgetCategory,
                isEmpty : boolean,
                parent? : WidgetHost)
    {
        super(type, category, isEmpty, parent);
    }
    
    /**
     * @return All immediate children of this widget,
     */
    abstract get children() : Widget[];

    /**
     * @return All widgets where this widgets is some kind of parent.
     */
    get widgets() : Widget[] {
        const subs = this.hostingChildren.map(c => c.children);
        return ([].concat(...subs));
    }

    /**
     * @return All children that may have children themselves.
     */
    get hostingChildren() :  WidgetHost[] {
        const toReturn : WidgetHost[] = (this.children.filter(isWidgetHost)) as any[];
        return (toReturn);
    }

    /**
     * Removes a child at the given position.
     *
     * @param index The position to remove the child at.
     */
    removeChildByIndex(index : number) : void {
        const length = this.children.length;
        if (index < 0 || index >= length) {
            throw new Error(`Attempted to remove child a ${index}, length is ${length}`);
        }
        
        this.children.splice(index, 1);
        this.fireModelChange();
    }

    /**
     * Searches for a widget that may be anywhere in the tree and removes it.
     */
    removeWidget(widgetRef : Widget, recursive : boolean) : boolean {
        const index = this.children.findIndex(rhs => widgetRef === rhs);
        if (index >= 0) {
            // Immediatly found, what a success
            this.removeChildByIndex(index);
            return (true);
        } else if (recursive) {
            // Not found, but a child might be lucky enough.
            // Yes, this is a call to `some` with a side-effect. That actually is
            // a little creepy ...
            return (this.hostingChildren.some(c => c.removeWidget(widgetRef, recursive)));
        } else {
            // Not found and no recursion allowed.
            return (false);
        }
    }

    /**
     * Per default these widgets accept nothing.
     */
    acceptsWidget(desc : WidgetDescription) : boolean {
        return (false);
    }

    /**
     * @param desc The description of the widget to add.
     * @param index The index the new widget will be added.
     *
     * @return The instantiated widget
     */
    addWidget(desc : WidgetDescription, index : number) : Widget {
        if (!this.acceptsWidget(desc)) {
            throw new Error(`Cant place ${desc.type} on ${this.type}`);
        }

        // Ensure widget index at least touches the current array
        if (index != 0 && index > this.children.length) {
            throw new Error(`Adding Widget ("${JSON.stringify(desc)}") exceeds widget count (given: ${index}, length ${this.children.length}`);
        }

        const widget = loadWidget(desc, this);
        this.children.splice(index, 0, widget);

        this.fireModelChange();

        return (widget);
    }
}

/**
 * A widget that needs specific external input to work.
 */
export abstract class ParametrizedWidget extends WidgetBase {

    constructor(type : string,
                category : WidgetCategory,
                isEmpty : boolean,
                parent? : WidgetHost)
    {
        super(type, category, isEmpty, parent);
    }

    /**
     * @return All parameters required for this widget
     */
    abstract get mapping() : ParameterMapping[];

    /**
     * @return True, if the given name is required as an input parameter.
     */
    hasInputParameter(name : string) {
        return (this.mapping.some(p => p.parameterName == name));
    }
}

/**
 * A widget that provides external input
 */
export abstract class UserInputWidget extends WidgetBase {

    constructor(type : string,
                category : WidgetCategory,
                isEmpty : boolean,
                parent? : WidgetHost)
    {
        super(type, category, isEmpty, parent);
    }

    /**
     * @return True, if this widget provides the required output.
     */
    abstract providesParameter(name : string) : boolean;
}

