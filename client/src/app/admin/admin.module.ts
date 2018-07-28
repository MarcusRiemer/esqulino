import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { AceEditorModule } from 'ng2-ace-editor';

import { SharedAppModule } from '../shared/shared.module'

import { adminRouting } from './admin.routes'

import { AdminComponent } from './admin.component'
import { AdminOverviewComponent } from './admin-overview.component'
import { EditGrammarComponent } from './edit-grammar.component'
import { LinkGrammarComponent } from './link-grammar.component'
import { JsonEditor } from './json-editor.component'

import { CreateBlockLanguageComponent } from './block-language/create-block-language.component'
import { EditBlockLanguageComponent } from './block-language/edit-block-language.component'
import { EditActualParameters } from './block-language/edit-actual-parameters.component'

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
    EditActualParameters,
    EditGrammarComponent,
    LinkGrammarComponent,
    JsonEditor
  ],
  exports: [
  ]
})
export class AdminModule { }
