import { Directive, ElementRef, Input } from '@angular/core';

import { Node, CodeResource } from '../../shared/syntaxtree';

import { DragService } from '../drag.service';

/**
 * Can be used for any element to register it as something
 * draggable.
 */
@Directive({
  selector: '[astDraggable]'
})
export class DraggableDirective {
  @Input('astDraggable') node: Node;
  @Input() codeResource: CodeResource;

  constructor(
    ref: ElementRef,
    dragService: DragService
  ) {
    // Grab the actual element and make it draggable
    const el = ref.nativeElement as HTMLElement;
    el.draggable = true;

    // Listen to to the dragstart event
    el.addEventListener("dragstart", (evt) => {
      // And tell the drag service that somethig is beeing dragged once
      // the event is fired.
      dragService.dragStart(evt, this.node.toModel(), undefined, {
        node: this.node,
        codeResource: this.codeResource,
      });
    });
  }
}
