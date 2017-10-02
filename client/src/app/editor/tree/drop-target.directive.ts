import { Directive, ElementRef, Input } from '@angular/core';

import { Node } from '../../shared/syntaxtree';

/**
 * Can be used for any element to register it as a drop
 * target for a certain node.
 */
@Directive({
  selector: '[astDropTarget]'
})
export class DropTargetDirective {

  @Input('astDropTarget') node: string;

  constructor(ref: ElementRef) {
    console.log("constructor for astDropTarget");

    const el: HTMLElement = ref.nativeElement;
    const prevColour = el.style.backgroundColor;

    // Ensures that the event is properly cancelled.
    const preventAndCancel = (evt: DragEvent) => {
      evt.preventDefault();
      evt.cancelBubble = true;
    };

    el.addEventListener("dragover", preventAndCancel);
    el.addEventListener("dragenter", (evt) => {
      el.style.backgroundColor = 'yellow';
      console.log("dragenter");
    });

    el.addEventListener("dragleave", (evt) => {
      el.style.backgroundColor = prevColour;
      console.log("dragleave");
    });

    el.addEventListener("dragend", (evt) => {
      el.style.backgroundColor = prevColour;
    });

    el.addEventListener("drop", evt => {
      preventAndCancel(evt);
    });

  }
}
