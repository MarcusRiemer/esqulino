import {
    Directive, ElementRef, Input, Output, EventEmitter,
    OnChanges, SimpleChanges, OnInit
} from "@angular/core";

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
        //'(keyup)': 'onChange()'
	}
})
export class ContenteditableModel implements OnInit {
	@Input('contenteditableModel') model: any;

    /**
     * Required to tell angular what to change.
     */
	@Output('contenteditableModelChange') update = new EventEmitter();

	private lastViewModel: any;

	constructor(private elRef: ElementRef) {
	}

    /**
     * Picks up the initial value that was assigned to this model
     */
    ngOnInit() {
        this.lastViewModel = this.elRef.nativeElement.innerText;
    }

    /**
     * Propagates changes if they have happened.
     */
	onChange() {
        const value = this.elRef.nativeElement.innerText;
        
        if (this.lastViewModel != value) {
            this.lastViewModel = value;
		    this.update.emit(value);
        }
	}

    /**
     * Prevents drag operations on this element.
     */
    onDragOperation(evt : Event) : boolean {
        evt.preventDefault();
        return (false);
    }
}
