import { Directive, ElementRef, Input } from '@angular/core';

import { VisualBlockDescriptions } from '../../../shared/block';

/**
 * Controls layout aspects of the given host block.   
 */
@Directive({
  selector: '[blockLayout]'
})
export class BlockLayoutDirective {

  @Input('blockLayout') layout: VisualBlockDescriptions.EditorLayout;

  private hostElement: HTMLElement;

  constructor(
    ref: ElementRef,
  ) {
    this.hostElement = ref.nativeElement as HTMLElement;
  }

  ngOnInit() {
    this.hostElement.style.display = "flex";
    this.hostElement.style.flexWrap = "wrap";
    this.hostElement.style.flexDirection = this.flexDirection(this.layout.direction);
    this.hostElement.style.alignItems = this.flexAlign(this.layout.direction);
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

  /**
   * @return Horizontal containers align to their center, vertical to their flex-start
   */
  private flexAlign(dir: string) {
    switch (dir) {
      case "horizontal": return ("center");
      case "vertical": return ("flex-start");
    }
  }

}
