import { NgModule, ErrorHandler, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Angulartics2Module } from 'angulartics2';
import { Angulartics2Piwik } from 'angulartics2/piwik';

import { environment } from '../environments/environment';

import { SharedAppModule } from './shared/shared.module';
import { FrontModule } from './front/front.module';
import { EditorModule } from './editor/editor.module';

import { SqlScratchComponent } from './app.component';
import { routing } from './app.routes';

import { NotifyErrorHandler } from './error-handler';

// Ensure the Piwik client object is globally available
declare var _paq: any[];
if (typeof window !== "undefined") {
  var _paq = (typeof (window as any)._paq === "undefined") ? [] : _paq;
  (window as any)._paq = _paq;
}

@NgModule({
  imports: [
    // Angular Core, universal rendering enabled
    BrowserModule.withServerTransition({
      appId: 'scratch-sql'
    }),
    BrowserAnimationsModule,

    // Tracking with Piwik
    Angulartics2Module.forRoot(),

    // Actual Application
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
  constructor(@Inject(PLATFORM_ID) platformId: string) {
    // Setting up Piwik if there is a configuration and we are running in the browser
    const piwikConf = environment.piwik;
    if (piwikConf && isPlatformBrowser(platformId)) {
      // Basic tracking settings
      _paq.push(['setTrackerUrl', piwikConf.host + '/piwik.php']);
      _paq.push(['setSiteId', piwikConf.id]);

      // Loading piwik.js
      const g = document.createElement('script')
      const s = document.getElementsByTagName('script')[0];
      g.type = 'text/javascript';
      g.async = true;
      g.defer = true;
      g.src = piwikConf.host + '/piwik.js';
      s.parentNode.insertBefore(g, s);

      console.log(`Piwik Tracking initialized for ID ${piwikConf.id} at "${piwikConf.host}"`);
    }
  }
}
