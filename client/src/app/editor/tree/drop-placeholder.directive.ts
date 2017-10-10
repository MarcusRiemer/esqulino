import { Directive, ElementRef, Input } from '@angular/core';

import { Node } from '../../shared/syntaxtree';

import { DragService } from './drag.service';

/**
 * Can be used for any element to register it as a drop
 * target for a placeholder after a certain node.
 */
@Directive({
  selector: '[astDropPlaceholder]'
})
export class DropPlaceholderDirective {

  @Input('astDropPlaceholder') node: Node;

  constructor(ref: ElementRef, dragService: DragService) {
    const el = ref.nativeElement as HTMLElement;

    // Ensures that the event is properly cancelled.
    const preventAndCancel = (evt: DragEvent) => {
      evt.preventDefault();
      evt.cancelBubble = true;
    };

    // Inform the drag service about hover events
    el.addEventListener("dragenter", evt => {
      preventAndCancel(evt);
      dragService.informDraggedOverPlaceholder(this.node.location);
    });

    // Make this target
    el.addEventListener("dragover", preventAndCancel);

    // Prevent the default action the browser would take
    el.addEventListener("drop", preventAndCancel);
  }
}
