import { Directive, ElementRef, Input } from '@angular/core';

import { EditorBlockDescriptions } from '../../../shared/block';

/**
 * Controls layout aspects of the given host block.   
 */
@Directive({
  selector: '[blockLayout]'
})
export class BlockLayoutDirective {

  @Input('blockLayout') layout: EditorBlockDescriptions.EditorLayout;

  private hostElement: HTMLElement;

  constructor(
    ref: ElementRef,
  ) {
    this.hostElement = ref.nativeElement as HTMLElement;
  }

  ngOnInit() {
    if (!this.layout) {
      debugger;
    }
    this.hostElement.style.display = "flex";
    this.hostElement.style.flexDirection = this.flexDirection(this.layout.direction);
    this.hostElement.style.flexWrap = "wrap";
  }

  /**
   * @return The direction in flex-specific terms.
   */
  private flexDirection(dir: string) {
    switch (dir) {
      case "horizontal": return "row";
      case "vertical": return "column";
    }
  }

}
