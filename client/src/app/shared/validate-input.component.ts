import {
  Component, Input, EventEmitter,
  Output, ElementRef, HostListener,
  ContentChild, Renderer2, AfterViewInit,
  ViewChild
} from "@angular/core";


@Component({
  selector: 'validate-input',
  templateUrl: './templates/validate-input.html'
})
export class ValidateInputComponent implements AfterViewInit {

  @Input() error: string;
  @Input() value: string;
  @Input() icon: string;

  @Input() clickAble: boolean = false;

  @Output() valueChange = new EventEmitter<string | number>();
  @Output() clicked = new EventEmitter<void>();

  @ViewChild('spanRef', { static: false }) spanRef: ElementRef;
  @ContentChild("inputRef", { static: false }) inputRef: ElementRef;

  @HostListener('change') onChange() {
    this.emitInput()
  }

  constructor(private _renderer: Renderer2) { }

  public getErrorMessage(): string {
    return this.error
  }

  public ngAfterViewInit(): void {
    if (this.clickAble) {
      this._renderer.setStyle(
        this.spanRef.nativeElement,
        "cursor",
        "pointer"
      )
    }
  }

  /**
   * Creates a font awesome class with a passed string
   * @retun font awesome class
   */
  public getIconClass(): string {
    return `fa fa-${this.icon}`
  }

  /** 
   * Returns the value of the input field
   * @return string or number depends on the type
  */
  public getValueOfInput(): string | number {
    return this.inputRef.nativeElement.value;
  }

  public isClickAble(): boolean {
    return this.clickAble
  }

  /**
   * Triggers event in the parent component if someone clicks on span element.
   * Use case of this is the interaction with the parent component.
   */
  public onClick(): void {
    this.clicked.emit();
  }

  public isIconActive(): boolean {
    return this.icon !== undefined
  }

  public isInputValid(): boolean {
    return this.inputRef.nativeElement.checkValidity();
  }

  public emitInput(): void {
    const value = this.isInputValid()
      ? this.getValueOfInput()
      : undefined
      ;

    this.valueChange.emit(value)
  }
}