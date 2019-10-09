import { NgModule, ErrorHandler, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { Angulartics2Module } from 'angulartics2';

import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';

import { environment } from '../environments/environment';

import { SharedAppModule } from './shared/shared.module';
import { FrontModule } from './front/front.module';
import { EditorModule } from './editor/editor.module';

import { SqlScratchComponent } from './app.component';
import { routing } from './app.routes';

import { NotifyErrorHandler, isApplicationCrashed } from './error-handler';

import registerLanguages from './locale-registration';
import { UserModule } from './user/user.module';
import { RequireLoggedInInterceptor } from './shared/require-logged-in.interceptor';

// Ensure the Piwik client object is globally available
declare var _paq: any[];
if (typeof window !== "undefined") {
  var _paq = (typeof (window as any)._paq === "undefined") ? [] : _paq;
  (window as any)._paq = _paq;
}

registerLanguages()

// Configure Sentry error reporting (if enabled)
if (environment.sentry && environment.sentry.active) {
  const options: Sentry.BrowserOptions = {
    dsn: environment.sentry.dsn,
    environment: environment.production ? "production" : "development",
    release: environment.version.hash,
    integrations: [
      new Integrations.Angular()
    ]
  };

  // Possibly also show a helpful dialogue
  if (environment.sentry.showDialogue) {
    options.beforeSend = event => {
      // Ensure that only the first dialog is ever shown.
      if (!isApplicationCrashed()) {
        Sentry.showReportDialog({
          dsn: options.dsn
        });
      }
      return event;
    };
  }

  Sentry.init(options);
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
    UserModule,
    routing,
  ],
  declarations: [
    SqlScratchComponent,
  ],
  providers: [
    Title,
    { provide: ErrorHandler, useClass: NotifyErrorHandler },
    { provide: HTTP_INTERCEPTORS, useClass: RequireLoggedInInterceptor, multi: true}
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
