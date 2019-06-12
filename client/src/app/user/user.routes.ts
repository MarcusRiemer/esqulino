import { RouterModule, Routes } from '@angular/router';

import { UserProfilComponent } from './user-profil.component';
import { ResetPasswordComponent } from './reset-password.component';
import { UserComponent } from './user.component';


export const userRoutes: Routes = [
  {
    path: '',
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
        path: 'reset_password',
        component: ResetPasswordComponent,
      },
    ]
  }
]

export const userRouting = RouterModule.forChild(userRoutes);