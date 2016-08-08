import {Component, Input}                 from '@angular/core'

import {Widget, WidgetHost, isWidgetHost} from '../../../shared/page/hierarchy'

@Component({
    templateUrl: 'app/editor/page/tree/templates/widget-node.html',
    selector: 'esqulino-widget-node',
    directives : [WidgetNode]
})
export class WidgetNode {
    @Input() widget : Widget;

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

    get needsClosingNode() : boolean {
        return (this.children.length > 0 || (!!(this.widget as any).text));
    }

    get isInline() : boolean {
        return (this.children.length == 0 && (!!(this.widget as any).text));
    }

    get isBlock() : boolean {
        return (!this.isInline);
    }
}
