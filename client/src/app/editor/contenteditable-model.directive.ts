import {
  Directive, ElementRef, Input, Output, EventEmitter, OnInit
} from "@angular/core"

/**
 * Allows to meaningfully bind the `contenteditable` property. This also
 * disables any drag & drop functionality because that is very likely
 * to cause havoc.
 */
@Directive({
  selector: '[contenteditableModel]',
  // We need to know if the hosting component loses focus.
  host: {
    '(blur)': 'onChange()',
    '(dragover)': 'onDragOperation($event)',
    '(drop)': 'onDragOperation($event)',
    '(keydown)': 'onKeyDown($event)'
  }
})
export class ContenteditableModel implements OnInit {
  @Input('contenteditableModel') model: any;

  /**
   *
   */
  @Input() allowBreak = true;

  /**
   * Required to tell angular what to change.
   */
  @Output('contenteditableModelChange') update = new EventEmitter();

  private lastViewModel: any;

  constructor(private elRef: ElementRef) {
  }

  /**
   * @return The text property of the native element
   */
  get nativeText() {
    return (this.elRef.nativeElement.textContent);
  }

  /**
   * @param value The text property of the native element
   */
  set nativeText(value: string) {
    this.elRef.nativeElement.textContent = value;
  }

  /**
   * Picks up the initial value that was assigned to this model
   */
  ngOnInit() {
    this.lastViewModel = this.model;
    this.nativeText = this.model;
  }

  /**
   * Propagates changes if they have happened.
   */
  onChange() {
    const value = this.nativeText;

    if (this.lastViewModel != value) {
      this.lastViewModel = value;
      this.update.emit(value);
    }
  }

  /**
   * Prevents drag operations on this element.
   */
  onDragOperation(evt: Event): boolean {
    evt.preventDefault();
    return (false);
  }

  /**
   * Possibly prevent linebreaks
   */
  onKeyDown(evt: KeyboardEvent) {
    // 13 seems to be ENTER
    if (evt.keyCode === 13 && !this.allowBreak) {
      evt.preventDefault();
    }
  }
}
