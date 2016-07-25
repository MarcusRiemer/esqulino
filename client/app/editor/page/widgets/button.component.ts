import {
    Component, Inject, OnInit, ChangeDetectorRef
} from '@angular/core'

import {Button}                       from '../../../shared/page/widgets/index'

import {SidebarService}               from '../../sidebar.service'
import {WIDGET_MODEL_TOKEN}           from '../../editor.token'

import {WidgetComponent}              from './widget.component'
import {
    BUTTON_SIDEBAR_IDENTIFIER, ButtonSidebarComponent
} from './button.sidebar.component'

export {Button}

@Component({
    templateUrl: 'app/editor/page/widgets/templates/button.html',
    selector: "esqulino-paragraph"
})
export class ButtonComponent extends WidgetComponent<Button> {
    
    constructor(@Inject(WIDGET_MODEL_TOKEN) model : Button,
                sidebarService : SidebarService,
                private _cdRef : ChangeDetectorRef) {
        super(sidebarService, model, {
            id: BUTTON_SIDEBAR_IDENTIFIER,
            type : ButtonSidebarComponent
        });
    }
}

