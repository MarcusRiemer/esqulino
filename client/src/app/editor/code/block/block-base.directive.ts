import { Directive, ElementRef, Input } from "@angular/core";

import { VisualBlockDescriptions } from "../../../shared/block";

/**
 * Controls basic styling aspects of blocks.
 */
@Directive({
  selector: "[blockBase]",
})
export class BlockBaseDirective {
  @Input("blockBase") layout: VisualBlockDescriptions.EditorBlockBase;

  private hostElement: HTMLElement;

  /**
   * Used to grab the native HTML-Element
   */
  constructor(ref: ElementRef) {
    this.hostElement = ref.nativeElement as HTMLElement;
  }

  /**
   * Applies the given styles to the native HTML element.
   */
  ngOnInit() {
    Object.entries(this.layout.style || {}).forEach(([key, value]) => {
      this.hostElement.style[key] = value;
    });
  }
}
