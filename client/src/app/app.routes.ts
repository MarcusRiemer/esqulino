import { Routes, RouterModule } from '@angular/router'

import { editorRoutes } from './editor/editor.routes'
import { frontRoutes } from './front/front.routes'
import { IsAdminGuard } from './shared/guards/is-admin.guard';
import { MasterGuard } from './shared/guards/master-guard';

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
    loadChildren: () => import('./user/user.module').then(m => m.UserModule)
  },
  {
    // The admin module has a few heavyweight dependencies and is
    // therefore not bundled with the main application.
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    data: {
      guards: [IsAdminGuard]
    },
    canActivate: [MasterGuard]
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
  // TODO-Tom ask marcus
  // onSameUrlNavigation: 'reload',
});
