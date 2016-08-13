import {NgModule}                          from '@angular/core'
import {BrowserModule}                     from '@angular/platform-browser'
import {HttpModule}                        from '@angular/http'
import {FormsModule}                       from '@angular/forms'

import {ServerApiService}                  from './shared/serverapi.service'

import {SqlScratchComponent}               from './app.component'
import {routing, appRoutingProviders}      from './app.routes'

import {EditorModule}                      from './editor/editor.module'
import {FrontModule}                       from './front/front.module'

import {QueryEditorModule}                 from './editor/query/editor.module'

@NgModule({
    imports: [
        HttpModule,
        BrowserModule,
        EditorModule,
        QueryEditorModule,
        FrontModule,
        routing
    ],
    declarations: [
        SqlScratchComponent,
    ],
    providers: [
        ServerApiService,
        appRoutingProviders
    ],
    exports: [
        HttpModule,
        FormsModule
    ],
    bootstrap: [
        SqlScratchComponent
    ],
})
export class AppModule {}
