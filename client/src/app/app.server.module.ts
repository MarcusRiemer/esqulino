import { NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { ServerModule } from '@angular/platform-server';
import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';

import { AppModule } from './app.module'
import { SqlScratchComponent } from './app.component';

import localeDe from '@angular/common/locales/de';

// registering local data for custom locales
registerLocaleData(localeDe, 'de');

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    ModuleMapLoaderModule
  ],
  bootstrap: [SqlScratchComponent]
})
export class AppServerModule { }
