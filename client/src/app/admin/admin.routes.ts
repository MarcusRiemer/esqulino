import { Routes, RouterModule } from '@angular/router'

import { AdminComponent, adminItems } from './admin.component'
import { AdminOverviewComponent } from './admin-overview.component'
import { EditGrammarComponent } from './edit-grammar.component'
import { EditBlockLanguageComponent } from './block-language/edit-block-language.component'
import { OverviewGrammarComponent } from './grammar/overview-grammar.component';
import { OverviewBlockLanguageComponent } from './block-language/overview-block-language.component'
import { NavSiteComponent } from '../shared/nav-page.component';
import { AdminNewsListComponent } from './news.component';
import { AdminNewsEditComponent } from './edit-news.component';
import { OverviewProjectComponent } from './project/overview-project.component';

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
        path: 'nav',
        component: NavSiteComponent,
        data: { items: adminItems }
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
      {
        path: 'project',
        component: OverviewProjectComponent
      },
      {
        path: 'news',
        component: AdminNewsListComponent
      },
      {
        path: 'news/edit/:newsId',
        component: AdminNewsEditComponent
      },
      {
        path: 'news/create',
        component: AdminNewsEditComponent
      }
    ]
  }
];

export const adminRouting = RouterModule.forChild(adminRoutes);
