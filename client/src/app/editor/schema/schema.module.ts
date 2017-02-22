import {NgModule, ModuleWithProviders}  from '@angular/core'

import {SharedEditorModule}             from '../shared/shared.module'
import {RegistrationService}            from '../registration.service'
import {SchemaHostComponent}            from './host.component'
import {SchemaService}                  from '../schema.service'
import {SchemaRedirectComponent}        from './schema-redirect.component'
import {SchemaComponent}                from './schema.component'
import {SchemaTableComponent}           from './schema-table.component'
import {SchemaTableCompositionComponent}from './schema-table-composition.component'
import {SchemaTableEditorComponent}     from './schema-table-editor.component'
import {SchemaTableDetailsComponent}    from './schema-table-details.component'




@NgModule({
    imports: [
        SharedEditorModule,
    ],    
    declarations: [
        SchemaHostComponent,
        SchemaRedirectComponent,
        SchemaComponent,
        SchemaTableComponent,
        SchemaTableCompositionComponent,
        SchemaTableEditorComponent,
        SchemaTableDetailsComponent,
    ],
    providers: [
        SchemaService
    ],
    entryComponents: [

    ],
    exports: [
        SchemaHostComponent
    ]
})
export class SchemaEditorModule {
    static forRoot() : ModuleWithProviders {
        return ({
            ngModule : SchemaEditorModule,

        });
    }

    constructor(reg : RegistrationService) {
        console.log("Registering SchemaEditor ...");

        console.log("Registered SchemaEditor!");
    }
}
