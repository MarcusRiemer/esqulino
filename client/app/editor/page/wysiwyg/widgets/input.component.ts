import {
    Component, Inject, OnInit, ChangeDetectorRef
} from '@angular/core'

import {Input}                        from '../../../../shared/page/widgets/index'

import {SidebarService}               from '../../../sidebar.service'
import {WIDGET_MODEL_TOKEN}           from '../../../editor.token'

import {WidgetComponent}              from '../../widget.component'
import {
    INPUT_SIDEBAR_IDENTIFIER, InputSidebarComponent
} from '../../sidebar/input.sidebar.component'


export {Input}

@Component({
    templateUrl: 'app/editor/page/wysiwyg/widgets/templates/input.html',
    selector: "esqulino-paragraph"
})
export class InputComponent extends WidgetComponent<Input> {
    
    constructor(@Inject(WIDGET_MODEL_TOKEN) model : Input,
                sidebarService : SidebarService,
                private _cdRef : ChangeDetectorRef) {
        super(sidebarService, model, {
            id: INPUT_SIDEBAR_IDENTIFIER,
            type : InputSidebarComponent
        });
    }

    /**
     * @return The caption of the input element
     */
    get caption() : string {
        return (this.model.caption);
    }

    /**
     * @param value The caption of the input element
     */
    set caption(value : string) {
        this.model.caption = value;
        this._cdRef.markForCheck();
    }
}
