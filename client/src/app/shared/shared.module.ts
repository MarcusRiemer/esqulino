import {NgModule, ModuleWithProviders}     from '@angular/core'
import {CommonModule}                      from '@angular/common'
import {FormsModule}                       from '@angular/forms'
import {RouterModule}                      from '@angular/router'
import {HttpModule}                        from '@angular/http'

// import {EsqulinoExceptionHandler}       from './exception-handler'
import {FlashMessageListComponent}         from './flash.component'
import {FlashService}                      from './flash.service'
import {ServerApiService}                  from './serverapi.service'
import {ProjectDescriptionService}         from './project.description.service'

/**
 * Bundles facilities that are used all over esqulino, no matter
 * what the exact domain is. This basically boils down to:
 * 
 * - User specific data and authentication
 * - Logging and error handling 
 */
@NgModule({
    imports : [
        CommonModule,
        FormsModule,
        RouterModule,
        HttpModule,
    ],
    declarations: [
        FlashMessageListComponent,
    ],
    exports: [
        CommonModule,
        FormsModule,
        RouterModule,
        HttpModule,

        FlashMessageListComponent,
    ]
})
export default class SharedAppModule {
    static forRoot() : ModuleWithProviders  {
        return ({
            ngModule : SharedAppModule,
            providers : [
                FlashService,
                ServerApiService,
                ProjectDescriptionService,
                // provide(ExceptionHandler, { useClass: EsqulinoExceptionHandler })
            ]
        });
    }
    
}
