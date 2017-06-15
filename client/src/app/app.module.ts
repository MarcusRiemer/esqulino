import {NgModule}                          from '@angular/core'
import {BrowserModule, Title}              from '@angular/platform-browser'

import {SharedAppModule}                   from './shared/shared.module'
import {FrontModule}                       from './front/front.module'
import {EditorModule}                      from './editor/editor.module'

import {SqlScratchComponent}               from './app.component'
import {routing}                           from './app.routes'

@NgModule({
    imports: [
        BrowserModule.withServerTransition({
            appId: 'scratch-sql'
        }),
        SharedAppModule.forRoot(),
        FrontModule,
        EditorModule,
        routing,
    ],
    declarations: [
        SqlScratchComponent,
    ],
    providers : [
        Title
    ],
    bootstrap: [
        SqlScratchComponent
    ],
    exports : [
        SharedAppModule,
    ]
})
export class AppModule {}
