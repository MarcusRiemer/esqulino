import {NgModule}                          from '@angular/core'
import {BrowserModule}                     from '@angular/platform-browser'
import {HttpModule}                        from '@angular/http'

import {ServerApiService}                  from './shared/serverapi.service'

import {SqlScratchComponent}               from './app.component'
import {routing}                           from './app.routes'

@NgModule({
    imports: [
        HttpModule,
        BrowserModule,
        routing
    ],
    declarations: [
        SqlScratchComponent,
    ],
    providers: [
        ServerApiService,
    ],
    bootstrap: [
        SqlScratchComponent
    ],
})
export class AppModule {}
