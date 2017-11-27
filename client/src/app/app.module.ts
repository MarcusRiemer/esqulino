import { NgModule, ErrorHandler } from '@angular/core'
import { BrowserModule, Title } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { SharedAppModule } from './shared/shared.module'
import { FrontModule } from './front/front.module'
import { EditorModule } from './editor/editor.module'

import { SqlScratchComponent } from './app.component'
import { routing } from './app.routes'

import { NotifyErrorHandler } from './error-handler'

@NgModule({
  imports: [
    BrowserModule.withServerTransition({
      appId: 'scratch-sql'
    }),
    BrowserAnimationsModule,
    SharedAppModule.forRoot(),
    FrontModule,
    EditorModule,
    routing,
  ],
  declarations: [
    SqlScratchComponent,
  ],
  providers: [
    Title,
    { provide: ErrorHandler, useClass: NotifyErrorHandler }
  ],
  bootstrap: [
    SqlScratchComponent
  ],
  exports: [
    SharedAppModule,
  ]
})
export class AppModule { }
