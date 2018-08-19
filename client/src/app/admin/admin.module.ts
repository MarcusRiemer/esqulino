import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { SharedAppModule } from '../shared/shared.module'

import { adminRouting } from './admin.routes'

import { AdminComponent } from './admin.component'
import { AdminOverviewComponent } from './admin-overview.component'
import { EditBlockLanguageComponent } from './edit-block-language.component'
import { EditGrammarComponent } from './edit-grammar.component'

@NgModule({
  imports: [
    CommonModule,
    SharedAppModule,
    adminRouting,
  ],
  declarations: [
    AdminComponent,
    AdminOverviewComponent,
    EditBlockLanguageComponent,
    EditGrammarComponent,
  ],
  exports: [
  ]
})
export class AdminModule { }
