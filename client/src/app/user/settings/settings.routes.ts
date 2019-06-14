
import { Routes, RouterModule } from '@angular/router';

import { AccountSettingsComponent } from './components/account-settings.component';
import { UserSettingsComponent } from './settings.component';
import { SecuritySettingsComponent } from './components/security-settings.component';
import { EmailSettingsComponent } from './components/email-settings.component';

export const userSettingsRoutes: Routes = [
  {
    path: '',
    component: UserSettingsComponent,
    children: [
      {
        path: '',
        component: AccountSettingsComponent
      },
      {
        path: 'account',
        component: AccountSettingsComponent
      },
      {
        path: 'security',
        component: SecuritySettingsComponent
      },
      {
        path: 'email',
        component: EmailSettingsComponent
      }
    ]
  }
]

export const userSettingsRouting = RouterModule.forChild(userSettingsRoutes)