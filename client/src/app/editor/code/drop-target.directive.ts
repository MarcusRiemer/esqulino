import { Directive, ElementRef, Input } from '@angular/core';

import { DragService } from '../drag.service';

import { BlockDropProperties } from './block/block-drop-properties';

/**
 * Can be used for any element to register it as a drop
 * target for a certain node.
 */
@Directive({
  selector: '[astDropTarget]'
})
export class DropTargetDirective {

  @Input('astDropTarget') dropProperties: BlockDropProperties;

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
      dragService.informDraggedOver(
        this.dropProperties.dropLocation,
        this.dropProperties.node
      );
    });

    // Make this target
    el.addEventListener("dragover", preventAndCancel);

    // Prevent the default action the browser would take
    el.addEventListener("drop", preventAndCancel);
  }
}
