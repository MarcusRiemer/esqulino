import {WidgetDescription}                    from './page.description'
import {Page}                                 from './page'

export {WidgetDescription}

export type WidgetCategory = "layout" | "widget" | "structural"

/**
 * Minimal description of a widget
 */
export interface Widget {
    /**
     * This discriminator value helps to reason about the
     * type of a widget.
     */
    type : string

    /**
     * A category that is primarily of interest to group things
     * for end-users.
     */
    category : WidgetCategory;

    /**
     * @return The parent of this widget.
     */
    parent : WidgetHost;

    /**
     * @return The page this widget is placed on,
     */
    page : Page;

    /**
     * @return The description of this widget.
     */
    toModel() : WidgetDescription;
}

/**
 * Something that can host other widgets. Most of the time this
 * will be a widget, but it could also be a Page.
 */
export interface WidgetHost {
    /**
     * @return All immediate children of this host.
     */ 
    children : Widget[];

    /**
     * Removes the given widget.
     *
     * @param widgetRef The widget to remove.
     * @param recursive Search more then immediate children?
     *
     * @return True, if the widget could be removed
     */
    removeWidget(widgetRef : Widget, recursive : boolean) : boolean

    /**
     * Removes a child by a known index.
     *
     * @param index The index to remove a child at.
     */
    removeChildByIndex(index : number) : void;

    /**
     * @return True, if the given widget is an acceptable child of this
     *         widget.
     */
    acceptsWidget(desc : WidgetDescription) : boolean;

    /**
     * @param desc The description of the widget to add.
     * @param index The index the new widget will be added.
     *
     * @return The instantiated widget
     */
    addWidget(desc : WidgetDescription, index : number) : Widget;

    /**
     * @return The page this widget-host is placed on,
     */
    page : Page;
}

/**
 * @return True if the given thing is an instance of WidgetHost
 */
export function isWidgetHost(obj : any): obj is WidgetHost {
    return (obj instanceof Object && "children" in obj);
}

/**
 * @return True if the given thing is an instance of WidgetHost
 */
export function isWidget(obj : any): obj is Widget {
    return (obj instanceof Object && "parent" in obj && "type" in obj && "page" in obj);
}
