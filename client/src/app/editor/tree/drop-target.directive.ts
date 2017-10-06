import { Directive, ElementRef, Input } from '@angular/core';

import { Node } from '../../shared/syntaxtree';

import { DragService } from './drag.service';

/**
 * Can be used for any element to register it as a drop
 * target for a certain node.
 */
@Directive({
  selector: '[astDropTarget]'
})
export class DropTargetDirective {

  @Input('astDropTarget') node: Node;

  constructor(ref: ElementRef, dragService: DragService) {
    const el: HTMLElement = ref.nativeElement;

    // Ensures that the event is properly cancelled.
    const preventAndCancel = (evt: DragEvent) => {
      evt.preventDefault();
      evt.cancelBubble = true;
    };

    // Inform the drag service about hover events
    el.addEventListener("dragenter", evt => {
      preventAndCancel(evt);
      dragService.informDraggedOverNode(this.node);
    });

    // Make this target
    el.addEventListener("dragover", preventAndCancel);

    // Prevent the default action the browser would take
    el.addEventListener("drop", preventAndCancel);
  }
}
