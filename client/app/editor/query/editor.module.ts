import {NgModule}                       from '@angular/core'
import {CommonModule}                   from '@angular/common'
import {FormsModule}                    from '@angular/forms'

import {SharedEditorModule}             from '../shared/shared.module'

import {queryEditorRouting}             from './editor.routes'

import {QueryEditorHostComponent}       from './host.component'
import {QueryEditorComponent}           from './editor.component'
import {QueryCreateComponent}           from './create.component'
import {QueryComponent, SqlStringPipe}  from './sql.component'
import {QuerySidebarComponent}          from './sidebar.component'
import {ResultComponent}                from './result.component'
import {ValidatorComponent}             from './validator.component'

import {SelectComponent}                from './sql-select.component'
import {DeleteComponent}                from './sql-delete.component'
import {FromComponent}                  from './sql-from.component'
import {WhereComponent}                 from './sql-where.component'
import {InsertComponent}                from './sql-insert.component'
import {ExpressionComponent}            from './sql-expr.component'


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        queryEditorRouting,
        SharedEditorModule
    ],    
    declarations: [
        QueryEditorHostComponent,
        QueryEditorComponent,
        QueryComponent,
        QueryCreateComponent,
        QuerySidebarComponent,
        ResultComponent,
        ValidatorComponent,
        SqlStringPipe,

        SelectComponent,
        DeleteComponent,
        FromComponent,
        WhereComponent,
        InsertComponent
    ],
    
})
export class QueryEditorModule {}
