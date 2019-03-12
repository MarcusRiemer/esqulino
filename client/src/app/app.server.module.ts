import { NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { ServerModule } from '@angular/platform-server';
import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';

import { AppModule } from './app.module'
import { SqlScratchComponent } from './app.component';

import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';

// registering local data for custom locales
registerLocaleData(localeDe, 'de');
registerLocaleData(localeFr, 'fr');

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    ModuleMapLoaderModule
  ],
  bootstrap: [SqlScratchComponent]
})
export class AppServerModule { }
