import {Component, Inject, Optional}   from '@angular/core'

import {Column}                        from '../../../shared/page/widgets/index'

import {
    SIDEBAR_MODEL_TOKEN, SIDEBAR_ID_TOKEN
} from '../../editor.token'

import {WidgetComponent}               from '../widget.component'

type EditedComponent = WidgetComponent<Column>

@Component({
    templateUrl: 'app/editor/page/sidebar/templates/column-sidebar.html',
})
export class ColumnSidebarComponent {

    private _model : Column;
    
    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : EditedComponent,
                @Inject(SIDEBAR_ID_TOKEN) public sidebarInstanceId : number) {
        this._model = com.model;
    }

    get model() {
        return (this._model);
    }

    /**
     * @return All possible widths for a column
     */
    get possibleWidths() : number[] {
        return ([1,2,3,4,5,6,7,8,9,10,11,12]);
    }
}

export const COLUMN_SIDEBAR_IDENTIFIER = "page-column";

export const COLUMN_REGISTRATION = {
    typeId : COLUMN_SIDEBAR_IDENTIFIER,
    componentType : ColumnSidebarComponent
}

