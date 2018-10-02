import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { Routes, RouterModule } from '@angular/router'

import { SqlScratchComponent } from './app.component';

import { SharedAppModule } from './shared/shared.module';

import { FrontModule } from './front/front.module';
import { frontRoutes } from './front/front.routes'

const serverRoutes: Routes = [
  {
    path: '',
    redirectTo: '/about',
    pathMatch: 'full',
  },
  {
    path: 'about',
    children: frontRoutes
  }
]

export const routing = RouterModule.forRoot(serverRoutes, {
  paramsInheritanceStrategy: "always"
});


@NgModule({
  imports: [
    SharedAppModule.forRoot(),
    FrontModule,
    ServerModule,
    routing
  ],
  bootstrap: [SqlScratchComponent]
})
export class AppServerModule { }
