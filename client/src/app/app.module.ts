import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Angulartics2Module } from 'angulartics2';
import { Angulartics2Piwik } from 'angulartics2/piwik';

import { SharedAppModule } from './shared/shared.module';
import { FrontModule } from './front/front.module';
import { EditorModule } from './editor/editor.module';

import { SqlScratchComponent } from './app.component';
import { routing } from './app.routes';

import { NotifyErrorHandler } from './error-handler';

import { environment } from 'environments/environment';

declare var Piwik: any;

@NgModule({
  imports: [
    // Angular Core
    BrowserModule.withServerTransition({
      appId: 'scratch-sql'
    }),
    BrowserAnimationsModule,

    // Tracking with Piwik
    Angulartics2Module.forRoot([Angulartics2Piwik]),

    // Application    
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
export class AppModule {
  // The piwik service needs to be required at least once
  constructor(piwik: Angulartics2Piwik) {
    const piwikConf = environment.piwik;
    if (piwikConf) {
      Piwik.addTracker(piwikConf.host + '/piwik.php', piwikConf.id);
    }
  }
}
