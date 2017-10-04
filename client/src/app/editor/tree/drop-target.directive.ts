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
    console.log("constructor for astDropTarget");

    const el: HTMLElement = ref.nativeElement;
    const prevColour = el.style.backgroundColor;

    // Ensures that the event is properly cancelled.
    const preventAndCancel = (evt: DragEvent) => {
      evt.preventDefault();
      evt.cancelBubble = true;
    };

    el.addEventListener("dragenter", evt => {
      preventAndCancel(evt);
      dragService.informDraggedOverNode(this.node);
    });

    el.addEventListener("drop", preventAndCancel);
  }
}
