import { Directive, ElementRef, Input, AfterViewInit } from "@angular/core";

@Directive({
  selector: '[focus]',
})
export class FocusDirective implements AfterViewInit {
  @Input() focus: boolean;
  constructor(
    private _elementRef: ElementRef
  ) { }

  ngAfterViewInit(): void {
    if (this.focus) { this._elementRef.nativeElement.focus(); }
  }
}