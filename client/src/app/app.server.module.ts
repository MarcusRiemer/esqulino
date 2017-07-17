import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppModule } from './app.module';
import { SqlScratchComponent } from './app.component';

@NgModule({
  imports: [
    ServerModule,
    AppModule
  ],
  bootstrap: [SqlScratchComponent]
})
export class AppServerModule { }
