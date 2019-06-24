import { AuthGuard } from './../shared/guards/auth.guard';
import { RouterModule, Routes } from '@angular/router';

import { UserProfilComponent } from './user-profil.component';
import { ResetPasswordComponent } from './reset-password.component';
import { UserComponent } from './user.component';


export const userRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: UserComponent,
    children: [
      {
        path: '',
        component: UserProfilComponent,
      },
      {
        path: 'profil',
        component: UserProfilComponent,
      },
      {
        path: 'settings',
        loadChildren: './settings/settings.module#UserSettingsModule',
      },
      {
        path: 'reset_password/:token',
        component: ResetPasswordComponent,
      },
    ]
  }
]

export const userRouting = RouterModule.forChild(userRoutes);