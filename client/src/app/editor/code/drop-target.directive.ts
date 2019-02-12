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
}
