import {NgModule, ModuleWithProviders}  from '@angular/core'

import SharedEditorModule               from '../shared/shared.module'
import {RegistrationService}            from '../registration.service'

import {queryEditorRouting}             from './editor.routes'
import {QueryExistsGuard}               from './query-exists.guard'

import {DragService}                    from './drag.service'

import {QueryEditorHostComponent}       from './host.component'
import {QueryEditorComponent}           from './editor.component'
import {QueryCreateComponent}           from './create.component'
import {QueryComponent, SqlStringPipe}  from './sql.component'
import {QuerySidebarComponent}          from './query.sidebar'
import {ResultComponent}                from './result.component'
import {ValidatorComponent}             from './validator.component'

import {OperatorPipe}                   from './operator.pipe'

import {SelectComponent}                from './sql-select.component'
import {DeleteComponent}                from './sql-delete.component'
import {FromComponent}                  from './sql-from.component'
import {WhereComponent}                 from './sql-where.component'
import {InsertComponent}                from './sql-insert.component'
import {ExpressionComponent}            from './sql-expr.component'

import {QueryColumnListComponent}       from './query-column-list.component'

@NgModule({
    imports: [
        SharedEditorModule,
        // queryEditorRouting,
    ],    
    declarations: [
        QueryEditorHostComponent,
        QueryEditorComponent,
        QueryCreateComponent,
        ResultComponent,
        ValidatorComponent,
        
        SqlStringPipe,
        OperatorPipe,

        QueryComponent,
        ExpressionComponent,
        SelectComponent,
        DeleteComponent,
        FromComponent,
        WhereComponent,
        InsertComponent,

        QuerySidebarComponent,
        QueryColumnListComponent,
    ],
    providers: [
        DragService,
        QueryExistsGuard,
    ],
    entryComponents: [
        QuerySidebarComponent
    ],
    exports: [
        QuerySidebarComponent,
        QueryEditorHostComponent,
        QueryEditorComponent,
        QueryCreateComponent,

        QueryColumnListComponent,
        ExpressionComponent,

        SqlStringPipe,
        OperatorPipe,
    ]
    
})
export default class QueryEditorModule {
    static forRoot() : ModuleWithProviders {
        return ({
            ngModule : QueryEditorModule,
            providers : [DragService]
        });
    }

    constructor(reg : RegistrationService) {
        console.log("Registering QueryEditor ...");

        // Register the query sidebar
        reg.registerSidebarType({
            typeId : QuerySidebarComponent.SIDEBAR_IDENTIFIER,
            componentType : QuerySidebarComponent
        });

        console.log("Registered QueryEditor!");
    }
}
