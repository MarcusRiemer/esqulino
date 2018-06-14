import { Routes, RouterModule } from '@angular/router'

import { AdminComponent } from './admin.component'
import { EditGrammarComponent } from './edit-grammar.component'
import { EditBlockLanguageComponent } from './edit-block-language.component'

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent
  },
  {
    path: 'grammar/:grammarId',
    component: EditGrammarComponent
  },
  {
    path: 'block-language/:blockLanguageId',
    component: EditBlockLanguageComponent
  },
];

export const adminRouting = RouterModule.forChild(adminRoutes);