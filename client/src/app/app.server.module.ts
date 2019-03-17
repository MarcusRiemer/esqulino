import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';

import { AppModule } from './app.module'
import { SqlScratchComponent } from './app.component';

import registerLanguages from './locale-registration';

registerLanguages()

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    ModuleMapLoaderModule
  ],
  bootstrap: [SqlScratchComponent]
})
export class AppServerModule { }
