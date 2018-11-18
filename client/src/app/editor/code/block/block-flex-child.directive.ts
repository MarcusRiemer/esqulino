import { Directive, ElementRef, Input } from '@angular/core'

import { VisualBlockDescriptions } from '../../../shared/block'

/**
 * Controls styling aspects that are important for flex children
 */
@Directive({
  selector: '[blockFlexChild]'
})
export class BlockFlexChildDirective {
  @Input('blockFlexChild') layout: VisualBlockDescriptions.EditorBlockBase;

  private hostElement: HTMLElement;

  /**
   * Used to grab the native HTML-Element
   */
  constructor(ref: ElementRef) {
    this.hostElement = ref.nativeElement as HTMLElement;
  }

  ngOnInit() {
    if (this.layout.breakAfter) {
      // Set CSS 3 and CSS 2.1 properties for better compatability
      this.hostElement.style.breakAfter = "always";
      this.hostElement.style.pageBreakAfter = "always";
    }
  }
}