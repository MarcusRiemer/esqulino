import { RouterModule, Routes } from '@angular/router';

import { UserComponent } from './user.component';
import { UserProfilComponent } from './user-profil.component';
import { ResetPasswordComponent } from './reset-password.component';



export const userRoutes: Routes = [
  {
    path: '',
    component: UserComponent,
    children: [
      {
        path: 'profil',
        component: UserProfilComponent,
      },
      {
        path: 'reset_password',
        component: ResetPasswordComponent,
      },
      {
        path: '',
        component: UserProfilComponent,
      }
    ]
  }
]

export const userRouting = RouterModule.forChild(userRoutes);