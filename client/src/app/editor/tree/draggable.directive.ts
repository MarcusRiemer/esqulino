import { Directive, ElementRef, Input } from '@angular/core';

import { Node } from '../../shared/syntaxtree';

import { DragService } from './drag.service';
import { TreeEditorService } from './editor.service'

/**
 * Can be used for any element to register it as something
 * draggable.
 */
@Directive({
  selector: '[astDraggable]'
})
export class DraggableDirective {
  @Input('astDraggable') node: Node;

  constructor(
    ref: ElementRef,
    dragService: DragService,
    treeService: TreeEditorService
  ) {
    const el = ref.nativeElement as HTMLElement;
    el.draggable = true;

    el.addEventListener("dragstart", (evt) => {
      dragService.dragStart(evt, this.node.toModel(), undefined,
        {
          node: this.node,
          treeEditorService: treeService
        }
      );
    });
  }
}
