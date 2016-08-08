import {Component, Input}                 from '@angular/core'

import {
    Widget, WidgetHost, isWidgetHost, isWidget
} from '../../../shared/page/hierarchy'

import {DragService, PageDragEvent}       from '../drag.service'

@Component({
    templateUrl: 'app/editor/page/tree/templates/widget-node.html',
    selector: 'esqulino-widget-node',
    directives : [WidgetNode]
})
export class WidgetNode {
    @Input() widget : Widget;

    constructor(
        private _dragService : DragService
    ) {}


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
        if (this.acceptsDrag(this.widget, pageEvt) ||
            this.acceptsDrag(this.widget.parent, pageEvt)) {
            evt.preventDefault();
        }
    }

    /**
     * Something has been dropped.
     */
    onDrop(evt : DragEvent, index : number) {
        evt.preventDefault();
        
        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        const host = this.acceptsDrag(this.widget, pageEvt);
        if (host) {
            // If we are adding at the parent, change the index to our
            // own index.
            if (host == this.widget.parent) {
                index = this.widget.parent.children.indexOf(this.widget) + 1;
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
        this._dragService.startWidgetDrag(evt, "page", this.widget.toModel(), {
            onRemove : () => this.widget.parent.removeWidget(this.widget, false),
            onWidget : (_) => this.widget.parent.removeWidget(this.widget, false),
        });
    }
    
    /**
     * Type-safe accessor for children.
     */
    get children() : Widget[] {
        if (isWidgetHost(this.widget)) {
            return (this.widget.children);
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
        return (this.children.length > 0 || (!!(this.widget as any).text));
    }

    /**
     * @return True, if the opening block should be in-line with the text and
     *         the closing block.
     */
    get isInline() : boolean {
        return (this.children.length == 0 && (!!(this.widget as any).text));
    }

    /**
     * @return True, if the opening and the closing block should be on their own
     *         line.
     */
    get isBlock() : boolean {
        return (!this.isInline);
    }
}
