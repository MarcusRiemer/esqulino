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
    // "flex" for easy layouting
    this.hostElement.style.display = "flex";

    // Its the decision of the language designer whether a row that is
    // too long should wrap around.
    this.hostElement.style.flexWrap = this.flexWrap(!!this.layout.wrapChildren);

    // Translate given direction to flex direction
    this.hostElement.style.flexDirection = this.flexDirection(this.layout.direction);

    // Alignment depends on the direction
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
      case "horizontal": return ("baseline");
      case "vertical": return ("flex-start");
    }
  }

  private flexWrap(wrapChildren: boolean) {
    return (wrapChildren) ? "wrap" : "nowrap";
  }
}
