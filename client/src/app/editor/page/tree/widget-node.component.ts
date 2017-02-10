import {Component, Input, Inject}         from '@angular/core'

import {
    WidgetDescription, Widget, WidgetHost, isWidgetHost, isWidget
} from '../../../shared/page/widgets/'

import {SidebarService}                   from '../../sidebar.service'
import {WIDGET_MODEL_TOKEN}               from '../../editor.token'

import {DragService, PageDragEvent}       from '../drag.service'
import {WidgetComponent}                  from '../widget.component'

/**
 * Specifies whether an operation has happened on the opening or
 * closing part of the node
 */
type NodeLocation = "open" | "close" | "child";

/**
 * Allows to override the default heuristic that determines whether
 * a widget should be displayed as block or inline.
 */
type TreeDisplayStyle = "block" | "inline";

interface DropLocation {
    host : WidgetHost,
    index : number
}

/**
 * Represents a widget as a node in a tree. This component is somewhat
 * agnostic about the element it displays and does it's best to provide
 * *some* representation for common properties.
 *
 * Most widgets however will want to provide their own tree-representation.
 * In this case this component should be used as a "HTML-parent" (called
 * "transcluding" in Angular 1) to provide a common look and feel for all
 * tree components.
 */
@Component({
    templateUrl: 'templates/widget-node.html',
    selector: 'esqulino-widget-node',
    inputs: ['model']
})
export class WidgetNodeComponent extends WidgetComponent<Widget> {
    /**
     * Allows to override the default heuristic that determines whether
     * a widget should be displayed as block or inline.
     */
    @Input() nodeDisplay : TreeDisplayStyle = undefined;

    /**
     * Used for DI, parameters are mostly passed on to base class.
     */
    constructor(
        @Inject(WIDGET_MODEL_TOKEN) model : Widget,
        private _dragService : DragService,
        _sidebarService : SidebarService
    ) {
        super(_sidebarService, model)
    }

    /**
     * @return True, if the parent of the given node would accept the given
     *         widget.
     */
    private parentAccepts(node : Widget | WidgetHost,
                          widgetDesc : WidgetDescription) : boolean {
        return (isWidget(node) &&
                isWidgetHost(node.parent) &&
                node.parent.acceptsWidget(widgetDesc));
    }

    /**
     * @return A widget host that would accept this widget, or `undefined` if there
     *         is no accepting host available.
     */
    private determineDropHost(node : Widget | WidgetHost,
                              place : NodeLocation,
                              widgetDesc : WidgetDescription)
      : WidgetHost
    {
        
        
        // Don't accept anything that isn't a widget
        if (!widgetDesc) {
            return (undefined);
        }
        // Is this an widget host?
        else if (isWidgetHost(node)) {
            // Is this on the opening node to insert something compatible
            // at the very beginning?
            if (node.acceptsWidget(widgetDesc) && place == "open") {
                // Then it can handle the drag itself
                return (node);
            }
            // Maybe the parent wants it?
            else if (place == "close" && this.parentAccepts(node, widgetDesc)) {
                // The parent can take it.
                return ((node as any).parent);
            } else {
                // Nobody wants it
                return (undefined)
            }

        }
        // Is the parent of this thing an accepting widget host?
        else if (this.parentAccepts(node, widgetDesc) && 
                 (place == "close" || (place == "open" && !this.needsClosingNode))) {
            // The parent can handle the drag
            return ((node as any).parent);
        }
        // No evidence found that we should accept this
        else {
            return (undefined);
        }
    }

    /**
     * Computes the exact location something should be dropped.
     */
    private dropLocation(dropTarget : Widget | WidgetHost,
                         place : NodeLocation,
                         pageEvt : PageDragEvent)
      : DropLocation
    {
        // No widget?
        if (!pageEvt.widget) {
            // No deal!
            return (undefined)
        }

        // Check which component would act as a drop target?
        const host = this.determineDropHost(this.model, place, pageEvt.widget);

        // No host?
        if (!host) {
            // No deal!
            return (undefined);
        } else {
            // Okay, components wants this thing, but where should it go?

            // True, if this node will be hosting the new node itself
            const parentHost = host == this.model.parent;
            const selfHost = !parentHost;

            let index : number = undefined;

            if (parentHost && (place === "close" || (place == "open" && !this.needsClosingNode))) {
                // Place after this element
                return ({
                    host : host,
                    index : this.model.parent.children.indexOf(this.model) + 1
                });
            } else if (selfHost && place === "open") {
                // Insert as new first element
                return ({
                    host : host,
                    index : 0
                });
            } else {
                // There currently shouldn't be any other possibility to drop
                // something
                // TODO: This will change with empty elements like `<img>`
                throw new Error("Surprising drop location");
            }
        }

    }

    /**
     * Giving feedback about ongoing drag operations.
     */
    onDragOverNode(evt : DragEvent, place : NodeLocation) {
        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));

        // Is this a meaningful child for this node or its parent?
        if ((pageEvt.row || pageEvt.widget) &&
            this.determineDropHost(this.model, place, pageEvt.widget)) {
            evt.preventDefault();
        }
    }

    /**
     * Something has been dropped.
     */
    onDropNode(evt : DragEvent, place : NodeLocation) {
        evt.preventDefault();

        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        let dropTarget = this.dropLocation(this.model, place, pageEvt);

        if (dropTarget) {
            dropTarget.host.addWidget(pageEvt.widget, dropTarget.index);

            if (this._dragService.currentDrag.callbacks.onWidget) {
                this._dragService.currentDrag.callbacks.onWidget(dropTarget.host);
            }

        } else {
            throw new Error("No valid drop target");
        }
    }

    /**
     * Something is going to be dragged.
     */
    onDragStart(evt : DragEvent) {
        this._dragService.startWidgetDrag(evt, "page", this.model.toModel(), {
            onRemove : () => this.model.parent.removeWidget(this.model, false),
            onWidget : (_) => this.model.parent.removeWidget(this.model, false),
        });
    }

    /**
     * Type-safe accessor for children.
     */
    get children() : Widget[] {
        if (isWidgetHost(this.model)) {
            return ((this.model as any).children);
        } else {
            return ([]);
        }
    }

    /**
     * The closing node might not need a border because it's not aligned
     * at the left.
     */
    get closingBorderCssClass() : string {
        if (this.isBlock) {
            return (this.borderCssClass);
        } else {
            return ("");
        }
    }

    /**
     * The index that would be used to insert something at the very
     * end of these children.
     */
    get afterLastChildIndex() : number {
        return (this.children.length);
    }

    /**
     * @return True, if a closing node for this widget should
     *         be rendered.
     */
    get needsClosingNode() : boolean {
        return (!this.model.isEmptyElement);
    }

    /**
     * @return True, if the opening block should be in-line with the text and
     *         the closing block.
     */
    get isInline() : boolean {
        return (this.nodeDisplay === "inline" ||
                this.children.length == 0 && !this.isLongText);
    }

    /**
     * @return True, if the opening and the closing block should be on their own
     *         line.
     */
    get isBlock() : boolean {
        return (this.nodeDisplay === "block" ||
                !this.isInline);
    }

    /**
     * @return True, if the text should be treated as a "full" child level.
     */
    get isLongText() : boolean {
        return (["paragraph","embedded-html"].indexOf(this.model.type) >= 0);
    }
}
