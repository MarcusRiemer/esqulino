import {Component, Input}                 from '@angular/core'

import {
    Widget, WidgetHost, isWidgetHost, isWidget
} from '../../../shared/page/hierarchy'

import {SidebarService}                   from '../../sidebar.service'

import {DragService, PageDragEvent}       from '../drag.service'
import {WidgetComponent}                  from '../widget.component'

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
     * @return True, if this drag event should be accepted.
     */
    private acceptsDrag(widget : Widget | WidgetHost, pageEvt : PageDragEvent) : WidgetHost {
        if (!pageEvt.widget) {
            return (undefined);
        } if (isWidgetHost(widget) &&
              widget.acceptsWidget(pageEvt.widget)) {
            return (widget);
        } else if (isWidget(widget) &&
                   isWidgetHost(widget.parent) &&
                   widget.parent.acceptsWidget(pageEvt.widget)) {
            return (widget.parent);
        } else {
            return (undefined);
        }
    }

    /**
     * Giving feedback about ongoing drag operations.
     */
    onDragOver(evt : DragEvent, index : number) {
        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));

        // Is this a meaningful child for this node or its parent?
        if (this.acceptsDrag(this.model, pageEvt) ||
            this.acceptsDrag(this.model.parent, pageEvt)) {
            evt.preventDefault();
        }
    }

    /**
     * Something has been dropped.
     */
    onDrop(evt : DragEvent, index : number) {
        evt.preventDefault();
        
        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        const host = this.acceptsDrag(this.model, pageEvt);
        if (host) {
            // If we are adding at the parent, change the index to our
            // own index.
            if (host == this.model.parent) {
                index = this.model.parent.children.indexOf(this.model) + 1;
            }
            
            host.addWidget(pageEvt.widget, index);

            if (this._dragService.currentDrag.callbacks.onWidget) {
                this._dragService.currentDrag.callbacks.onWidget(host);
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
        return (this.children.length > 0 || (!!(this.model as any).text));
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
