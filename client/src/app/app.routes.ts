import { Routes, RouterModule } from '@angular/router'

import { editorRoutes } from './editor/editor.routes'
import { frontRoutes } from './front/front.routes'

const AppRoutes: Routes = [
  {
    path: '',
    redirectTo: '/about',
    pathMatch: 'full',
  },
  {
    path: 'editor/:projectId',
    children: editorRoutes
  },
  {
    path: 'about',
    children: frontRoutes
  },
  {
    // The admin module has a few heavyweight dependencies and is
    // therefore not bundled with the main application.
    path: 'admin',
    loadChildren: './admin/admin.module#AdminModule'
  }
]

export const routing = RouterModule.forRoot(AppRoutes, {
  paramsInheritanceStrategy: "always",
});
