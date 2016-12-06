import {NgModule, ModuleWithProviders}  from '@angular/core'

import SharedEditorModule               from '../shared/shared.module'
import {RegistrationService}            from '../registration.service'
import {SchemaHostComponent}            from './host.component'




@NgModule({
    imports: [
        SharedEditorModule,
    ],    
    declarations: [
        SchemaHostComponent
    ],
    providers: [

    ],
    entryComponents: [

    ],
    exports: [
        SchemaHostComponent
    ]
})
export default class SchemaEditorModule {
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
