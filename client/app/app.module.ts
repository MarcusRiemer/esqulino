import {NgModule}                          from '@angular/core'
import {BrowserModule}                     from '@angular/platform-browser'
import {HttpModule}                        from '@angular/http'

import FrontModule                         from './front/front.module'
import EditorModule                        from './editor/editor.module'

import {ServerApiService}                  from './shared/serverapi.service'

import {SqlScratchComponent}               from './app.component'
import {routing}                           from './app.routes'

@NgModule({
    imports: [
        HttpModule,
        BrowserModule,
        FrontModule,
        EditorModule,
        routing,
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
export default class AppModule {}
