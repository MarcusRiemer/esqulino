import {Component, Input}                 from '@angular/core'

import {
    Widget, WidgetHost, isWidgetHost, isWidget
} from '../../../shared/page/hierarchy'

import {SidebarService}                   from '../../sidebar.service'

import {DragService, PageDragEvent}       from '../drag.service'
import {WidgetComponent}                  from '../widget.component'

// Specifies whether an operation has happened on the opening or
// closing part of the node
type NodeLocation = "open" | "close";

/**
 * Represents a widget as a node in a tree.
 */
@Component({
    templateUrl: 'app/editor/page/tree/templates/widget-node.html',
    selector: 'esqulino-widget-node',
    inputs: ['model']
})
export class WidgetNode extends WidgetComponent<Widget> {
    constructor(
        private _dragService : DragService,
        _sidebarService : SidebarService
    ) {
        super(_sidebarService)
    }

    /**
     * @return A widget host that would accept this widget, or `undefined` if there 
     *         is no accepting host available.
     */
    private acceptsDrag(widget : Widget | WidgetHost, pageEvt : PageDragEvent) : WidgetHost {
        // Don't accept anything that isn't a widget
        if (!pageEvt.widget) {
            return (undefined);
        }
        // Is this an accepting widget host?
        else if (isWidgetHost(widget) &&
                 widget.acceptsWidget(pageEvt.widget)) {
            // Then it can handle the drag itself
            return (widget);
        }
        // Is the parent of this thing an accepting widget host?
        else if (isWidget(widget) &&
                 isWidgetHost(widget.parent) &&
                 widget.parent.acceptsWidget(pageEvt.widget)) {
            // The parent can handle the drag
            return (widget.parent);
        }
        // No evidence found that we should accept this
        else {
            return (undefined);
        }
    }

    /**
     * Giving feedback about ongoing drag operations.
     */
    onDragOverNode(evt : DragEvent, place : NodeLocation) {
        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));

        // Is this a meaningful child for this node or its parent?
        if (this.acceptsDrag(this.model, pageEvt)) {
            evt.preventDefault();
        }
    }

    /**
     * Something has been dropped.
     */
    onDropNode(evt : DragEvent, place : NodeLocation) {
        evt.preventDefault();

        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        let host = this.acceptsDrag(this.model, pageEvt);
        
        if (host) {
            // True, if this node will be hosting the new node itself
            const parentHost = host == this.model.parent;
            const selfHost = !parentHost;
            
            let index : number = undefined;

            if (parentHost && place === "open") {
                // No placement, the opening node is meant for children
                index = undefined;
            } else if (parentHost && place === "close") {
                // Place after this element
                index = this.model.parent.children.indexOf(this.model) + 1;
            } else if (selfHost && place === "open") {
                // Insert as new first element
                index = 0;
            } else if (selfHost && place === "close" && this.model.parent.acceptsWidget(pageEvt.widget)) {
                // Insert after self, going up to the parent
                host = this.model.parent;
                index =  this.model.parent.children.indexOf(this.model) + 1;
            }
            
            if (index != undefined) {
                host.addWidget(pageEvt.widget, index);

                if (this._dragService.currentDrag.callbacks.onWidget) {
                    this._dragService.currentDrag.callbacks.onWidget(host);
                }
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
        return (true);
    }

    /**
     * @return True, if the opening block should be in-line with the text and
     *         the closing block.
     */
    get isInline() : boolean {
        return (this.children.length == 0 && (!!(this.model as any).text));
    }

    /**
     * @return True, if the opening and the closing block should be on their own
     *         line.
     */
    get isBlock() : boolean {
        return (!this.isInline);
    }
}
