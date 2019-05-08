import { Directive, ElementRef, Input, OnChanges } from "@angular/core";

@Directive({
  selector: '[focus]',
})
export class FocusDirective implements OnChanges {
  @Input() focus: boolean;
  constructor(
    private _elementRef: ElementRef
  ) {}

  ngOnChanges(): void {
    if (this.focus) { this._elementRef.nativeElement.focus(); }
  }
}