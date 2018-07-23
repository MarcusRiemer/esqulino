import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { AceEditorModule } from 'ng2-ace-editor';

import { SharedAppModule } from '../shared/shared.module'

import { adminRouting } from './admin.routes'

import { AdminComponent } from './admin.component'
import { AdminOverviewComponent } from './admin-overview.component'
import { CreateBlockLanguageComponent } from './create-block-language.component'
import { EditBlockLanguageComponent } from './edit-block-language.component'
import { EditGrammarComponent } from './edit-grammar.component'
import { LinkGrammarComponent } from './link-grammar.component'

@NgModule({
  imports: [
    AceEditorModule,
    CommonModule,
    SharedAppModule,
    adminRouting,
  ],
  declarations: [
    AdminComponent,
    AdminOverviewComponent,
    CreateBlockLanguageComponent,
    EditBlockLanguageComponent,
    EditGrammarComponent,
    LinkGrammarComponent,
  ],
  exports: [
  ]
})
export class AdminModule { }
