import { Routes, RouterModule } from '@angular/router'

import { AdminComponent } from './admin.component'
import { AdminOverviewComponent } from './admin-overview.component'
import { EditGrammarComponent } from './edit-grammar.component'
import { EditBlockLanguageComponent } from './block-language/edit-block-language.component'
import { OverviewGrammarComponent } from './grammar/overview-grammar.component';
import { OverviewBlockLanguageComponent } from './block-language/overview-block-language.component'

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
        path: 'grammar',
        component: OverviewGrammarComponent
      },
      {
        path: 'grammar/:grammarId',
        component: EditGrammarComponent
      },
      {
        path: 'block-language',
        component: OverviewBlockLanguageComponent
      },
      {
        path: 'block-language/:blockLanguageId',
        component: EditBlockLanguageComponent
      },
    ]
  }
];

export const adminRouting = RouterModule.forChild(adminRoutes);
