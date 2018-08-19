import { Routes, RouterModule } from '@angular/router'

import { AdminComponent } from './admin.component'
import { AdminOverviewComponent } from './admin-overview.component'
import { EditGrammarComponent } from './edit-grammar.component'
import { EditBlockLanguageComponent } from './edit-block-language.component'

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        component: AdminOverviewComponent,
        pathMatch: 'full'
      },
      {
        path: 'grammar/:grammarId',
        component: EditGrammarComponent
      },
      {
        path: 'block-language/:blockLanguageId',
        component: EditBlockLanguageComponent
      },
    ]
  }
];

export const adminRouting = RouterModule.forChild(adminRoutes);
