import {NgModule, ModuleWithProviders}  from '@angular/core'

import SharedEditorModule               from '../shared/shared.module'
import {RegistrationService}            from '../registration.service'




@NgModule({
    imports: [
        SharedEditorModule,
        // queryEditorRouting,
    ],    
    declarations: [

    ],
    providers: [

    ],
    entryComponents: [

    ],
    exports: [

    ]
})
export default class QueryEditorModule {
    static forRoot() : ModuleWithProviders {
        return ({
            ngModule : QueryEditorModule,

        });
    }

    constructor(reg : RegistrationService) {
        console.log("Registering QueryEditor ...");

        console.log("Registered QueryEditor!");
    }
}
