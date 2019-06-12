import { adminRoutes } from './admin/admin.routes';
import { Routes, RouterModule } from '@angular/router'

import { editorRoutes } from './editor/editor.routes'
import { frontRoutes } from './front/front.routes'
import { userRoutes } from './user/user.routes';

const AppRoutes: Routes = [
  {
    path: 'editor/:projectId',
    children: editorRoutes
  },
  {
    path: 'about',
    children: frontRoutes
  },
  {
    path: 'user',
    loadChildren: './user/user.module#UserModule',
  },
  {
    // The admin module has a few heavyweight dependencies and is
    // therefore not bundled with the main application.
    path: 'admin',
    loadChildren: './admin/admin.module#AdminModule',
    // loadChildren : () => import('./admin/admin.module').then(m => m.AdminModule), // new dynamic import method
  },
  {
    path: '',
    redirectTo: '/about',
    pathMatch: 'full',
  },
]

// Ensure that "global" parameters (especially the projectId)
// is passed down to the editor modules.
export const routing = RouterModule.forRoot(AppRoutes, {
  paramsInheritanceStrategy: "always",
});
