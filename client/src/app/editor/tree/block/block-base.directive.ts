import { Directive, ElementRef, Input } from '@angular/core';

import { VisualBlockDescriptions } from '../../../shared/block';

/**
 * Controls basic styling aspects of blocks.
 */
@Directive({
  selector: '[blockBase]'
})
export class BlockBaseDirective {

  @Input('blockBase') layout: VisualBlockDescriptions.EditorBlockBase;

  private hostElement: HTMLElement;

  constructor(
    ref: ElementRef,
  ) {
    this.hostElement = ref.nativeElement as HTMLElement;
  }

  ngOnInit() {
    this.hostElement.style.marginLeft = this.layout.marginLeft;
  }

}