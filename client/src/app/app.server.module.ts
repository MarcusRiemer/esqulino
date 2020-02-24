import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module'
import { SqlScratchComponent } from './app.component';

import registerLanguages from './locale-registration';

registerLanguages()

@NgModule({
  imports: [
    AppModule,
    ServerModule
],
  bootstrap: [SqlScratchComponent]
})
export class AppServerModule { }
